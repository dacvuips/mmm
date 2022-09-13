---
to: <%= h.dir(name, true) %>/<%= h.name(name, true) %>.graphql.ts
---
import { gql } from "apollo-server-express";
import { Context } from "<%= h.importPath(name, 'src/graphql/context', true) %>";

export default {
  schema: gql`
    extend type Query {
      <%= h.name(name, true) %>: Mixed
    }
  `,
  resolver: {
    Query: {
      <%= h.name(name, true) %>: async (root: any, args: any, context: Context) => {
      }
    },
  },
};
