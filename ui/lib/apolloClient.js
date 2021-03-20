import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import fetch from "isomorphic-unfetch";
import { setContext } from "apollo-link-context";
import getHostInfo from "utils/getHostInfo";
import auth from "lib/auth";

export default function createApolloClient(initialState, ctx) {
  // The `ctx` (NextPageContext) will only be present on the server.
  // use it to extract auth headers (ctx.req) or similar.

  const httpLink = new HttpLink({
    uri: process.env.GRAPHQL_URL, // Server URL (must be absolute)
    credentials: "same-origin", // Additional fetch() options like `credentials` or `headers`
    fetch,
  });

  const authLink = setContext(async (graphqlRequest, { headers }) => {
    let token;

    // strategy to get token from here: https://gist.github.com/BryceAMcDaniel/a710afe4fd877a04e55a921e4e74a21c

    if (ctx?.req) {
      try {
        const { accessToken } = await auth(ctx.req).getAccessToken(
          ctx.req,
          ctx.res
        );
        token = accessToken;
      } catch (error) {
        console.log(error);
      }
    } else {
      const response = await fetch("/api/getToken", {
        credentials: "same-origin",
      });

      token = await response.text();
    }

    let { host, subdomain } = getHostInfo(ctx?.req);
    let customdomain;

    if (
      !(
        host.endsWith(process.env.DEPLOY_URL) ||
        host.endsWith("localhost:3000") ||
        host.endsWith("staging.dreams.wtf")
      )
    ) {
      customdomain = host;
      subdomain = null;
    }

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
