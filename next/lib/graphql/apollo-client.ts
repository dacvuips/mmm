import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { ApolloLink, split } from "apollo-link";
import { useMemo } from "react";

import { AuthLink } from "./auth.link";
import { ErrorLink } from "./error.link";
import { WSLink } from "./graphql-ws.link";

let apolloClient: ApolloClient<NormalizedCacheObject>;

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === "undefined", // set to true for SSR
    link: ApolloLink.from([
      (ErrorLink as unknown) as ApolloLink,
      (AuthLink as unknown) as ApolloLink,
      split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" && definition.operation === "subscription"
          );
        },
        WSLink as any,
        new HttpLink({ uri: `/graphql` }) as any
      ),
    ]) as any,
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(initialState = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client,
  // the initial state gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Restore the cache using the data passed from
    // getStaticProps/getServerSideProps combined with the existing cached data
    _apolloClient.cache.restore({ ...existingCache, ...initialState });
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;
  return _apolloClient;
}

export function useApollo() {
  const store = useMemo(() => initializeApollo(), []);
  return store;
}
