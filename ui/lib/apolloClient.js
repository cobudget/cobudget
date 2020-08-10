import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import fetch from "isomorphic-unfetch";
import { setContext } from "apollo-link-context";
import cookies from "next-cookies";
import getHostInfo from "utils/getHostInfo";

export default function createApolloClient(initialState, ctx) {
  // The `ctx` (NextPageContext) will only be present on the server.
  // use it to extract auth headers (ctx.req) or similar.

  const httpLink = new HttpLink({
    uri: process.env.GRAPHQL_URL, // Server URL (must be absolute)
    credentials: "same-origin", // Additional fetch() options like `credentials` or `headers`
    fetch,
  });

  const authLink = setContext((req, { headers }) => {
    const { token } = cookies(ctx || {});

    let { host, subdomain } = getHostInfo(ctx?.req);
    let customdomain;

    if (!host.endsWith(process.env.DEPLOY_URL)) {
      customdomain = host;
      subdomain = null;
    }

    console.log({ host, customdomain, subdomain });

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
        ...(subdomain && {
          ["dreams-subdomain"]: subdomain,
        }),
        ...(customdomain && {
          ["dreams-customdomain"]: customdomain,
        }),
      },
    };
  });

  return new ApolloClient({
    ssrMode: Boolean(ctx),
    link: authLink.concat(httpLink),
    cache: new InMemoryCache().restore(initialState),
  });
}
