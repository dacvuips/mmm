import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

import { getCurrentToken } from "./auth.link";

let wsLink;
if (typeof window !== "undefined") {
  let protocol = "ws";
  let host = "localhost:5000";

  if (typeof location != "undefined") {
    protocol = location.protocol == "http:" ? "ws" : "wss";

    if (location.protocol != "http:") {
      host = location.host;
    }
  }

  const client = createClient({
    url: `${protocol}://${host}/graphql`,
    lazy: true,

    connectionParams: () => {
      const token = getCurrentToken();
      return {
        "x-token": token || null,
      };
    },
  });
  // @ts-ignore
  // client.maxConnectTimeGenerator.setMin(10000);
  wsLink = new GraphQLWsLink(client);
}

export const WSLink: GraphQLWsLink = wsLink;
