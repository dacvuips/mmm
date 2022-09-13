import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { ApolloServer, gql } from "apollo-server-express";
import { Application } from "express";
import GraphQLDateTime from "graphql-type-datetime";
import { useServer } from "graphql-ws/lib/use/ws";
import { Server } from "http";
import _ from "lodash";
import minifyGql from "minify-graphql-loader";
import morgan from "morgan";
import path from "path";
import { WebSocketServer } from "ws";

import { Request } from "../base/baseRoute";
import { BaseError } from "../base/error";
import { configs } from "../configs";
import { UtilsHelper } from "../helpers";
import { logger } from "../loaders/logger";
import { onContext } from "./context";

export default async (app: Application, httpServer: Server) => {
  const typeDefs = [
    gql`
      scalar Mixed
      scalar DateTime

      type Query {
        _empty: String
      }
      type Mutation {
        _empty: String
      }
      type Subscription {
        _empty: String
      }
      input QueryGetListInput {
        limit: Int
        offset: Int
        page: Int
        order: Mixed
        filter: Mixed
        search: String
      }

      type Pagination {
        limit: Int
        offset: Int
        page: Int
        total: Int
      }
    `,
  ];

  let resolvers = {
    DateTime: GraphQLDateTime,
  };
  let defaultFragment: any = {};

  const ModuleFiles = UtilsHelper.walkSyncFiles(path.join(__dirname, "modules"));
  ModuleFiles.filter((f: any) => /(.*).schema.js$/.test(f)).map((f: any) => {
    const { default: schema } = require(f);
    typeDefs.push(schema);
  });
  ModuleFiles.filter((f: any) => /(.*).resolver.js$/.test(f)).map((f: any) => {
    const { default: resolver } = require(f);
    resolvers = _.merge(resolvers, resolver);
  });
  ModuleFiles.filter((f: any) => /(.*).fragment.js$/.test(f)).map((f: any) => {
    const { default: fragment } = require(f);
    defaultFragment = _.merge(defaultFragment, fragment);
  });
  ModuleFiles.filter((f: any) => /(.*).graphql.js$/.test(f)).map((f: any) => {
    const {
      default: { resolver, schema },
    } = require(f);
    if (schema) typeDefs.push(schema);
    if (resolver) resolvers = _.merge(resolvers, resolver);
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema: schema,
    introspection: true,
    context: onContext,
    debug: configs.debug,

    formatError(err) {
      if (!(err.originalError instanceof BaseError)) {
        logger.error(err.originalError?.message || err.message, err.originalError || err);
      }
      return err;
    },

    // subscriptions: {
    //   onConnect: (connectionParams, webSocket) => connectionParams,
    // },
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageGraphQLPlayground({ endpoint: "/graphql" }),
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              console.log("drainServer");
              await serverCleanup.dispose();
            },
          } as any;
        },
      },
    ],
  });

  const defaultFragmentFields = Object.keys(defaultFragment);
  morgan.token("gql-query", (req: Request) => _.get(req, "gql", ""));
  app.use(
    "/graphql",
    // graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
    (req, res, next) => {
      if (req.body && req.body.query) {
        const query = gql(req.body.query);
        const operation = _.get(query, "definitions.0.operation", "");
        const selection = _.get(query, "definitions.0.selectionSet.selections.0.name.value", "");
        _.set(req, "gql", `${operation} ${selection}`);

        // let minify = minifyGql(req.body.query);
        // for (const field of defaultFragmentFields) {
        //   minify = minify.replace(
        //     new RegExp(field + "( |})", "g"),
        //     field + defaultFragment[field] + "$1"
        //   );
        // }
        // req.body.query = minify;
      }
      next();
    },
    morgan(
      ":remote-addr :remote-user :method :url :gql-query HTTP/:http-version :status :res[content-length] - :response-time ms",
      { skip: (req: Request) => (_.get(req, "body.query") || "").includes("IntrospectionQuery") }
    )
  );

  await server.start();
  server.applyMiddleware({ app });

  // Creating the WebSocket server
  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    ...(configs.nextDev ? { port: 5000 } : { server: httpServer }),
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: "/graphql",
  });
  // Hand in the schema we just created and have the
  // WebSocketServer start listening.
  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx, msg, args) => {
        return await onContext({ connection: { context: ctx.connectionParams } });
      },
    },
    wsServer
  );

  console.log(`\n Running Apollo Server on Path: ${configs.domain}${server.graphqlPath}`);
};
