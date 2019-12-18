import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import withApollo from "next-with-apollo";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import cookies from "next-cookies";
import fetch from "isomorphic-unfetch";

const link = createHttpLink({
  fetch, // Switches between unfetch & node-fetch for client & server.
  uri: process.env.GRAPHQL_URL
});

// Export a HOC from next-with-apollo
// Docs: https://www.npmjs.com/package/next-with-apollo
export default withApollo(
  // You can get headers and ctx (context) from the callback params
  // e.g. ({ headers, ctx, initialState })
  ({ initialState, ctx }) => {
    const authLink = setContext((req, { headers }) => {
      const { token } = cookies(ctx || {});

      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : ""
        }
      };
    });

    return new ApolloClient({
      link: authLink.concat(link),
      cache: new InMemoryCache()
        //  rehydrate the cache using the initial data passed from the server:
        .restore(initialState || {})
    });
  },
  { getDataFromTree: "ssr" }
);
