import { onError } from "apollo-link-error";
export const ErrorLink = onError(({ graphQLErrors, networkError, forward }) => {
  let errorMessage = "";
  console.error(graphQLErrors ? `[GraphQL]` : `[Network]`, graphQLErrors || networkError);
  if (graphQLErrors) {
    graphQLErrors.map((error) => {
      errorMessage = `${error.message}`;
    });
  }

  if (networkError) {
    const netErr = networkError as any;
    if (netErr.error && netErr.error.errors) {
      errorMessage = `[Network error]: ${netErr.error.errors[0].message}`;
      networkError.message = netErr.error.errors[0].message;
    } else {
      errorMessage = `[Network error]: ${networkError}`;
    }
  }
});
