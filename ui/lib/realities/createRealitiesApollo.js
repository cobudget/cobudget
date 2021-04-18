import { gql, ApolloClient, ApolloLink, split, HttpLink } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";
import { setContext } from "@apollo/client/link/context";
import { InMemoryCache } from "@apollo/client/cache";
import getHostInfo from "utils/getHostInfo";

const defaults = {
  showCreateNeed: false,
  showCreateResponsibility: false,
  showDetailedEditNeedView: false,
  showDetailedEditRespView: false,
};
const CACHE_QUERY = gql`
  query ShowCreates {
    showCreateNeed @client
    showCreateResponsibility @client
    showDetailedEditNeedView @client
    showDetailedEditRespView @client
  }
`;

// import introspectionQueryResultData from './fragmentTypes.json';

// removed from apollo
// todo: probably remove since apollo figures out the types automatically or
// something like that. also remove the automatic generation of the imported
// json file
/* const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData,
}); */

async function makeContext(orgSlug) {
  // const token = window.sessionStorage.getItem("accessToken");

  const response = await fetch("/api/getToken", {
    credentials: "same-origin",
  });

  const token = await response.text();

  const authObj = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

  return {
    orgSlug,
    ...authObj,
  };
}

export default function createRealitiesApollo() {
  if (typeof window === "undefined") return null;

  const { subdomain: orgSlug } = getHostInfo();

  const cache = new InMemoryCache({
    // remember to fetch nodeId/orgId even if we don't use it, because of
    // https://stackoverflow.com/questions/48840223/apollo-duplicates-first-result-to-every-node-in-array-of-edges
    dataIdFromObject: (object) =>
      `${object.__typename}:${object.nodeId}:${object.orgId}`,
    // fragmentMatcher,
  });

  const authMiddleware = setContext(async () => ({
    headers: await makeContext(orgSlug),
  }));

  const httpLink = new HttpLink({
    uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
  });

  const wsLink = new WebSocketLink({
    uri: process.env.REACT_APP_GRAPHQL_SUBSCRIPTION,
    options: {
      reconnect: true,
      // TODO: i don't think this gets a new token when the token's refreshed
      connectionParams: makeContext(orgSlug),
    },
  });

  // using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  const terminatingLink = split(
    // split based on operation type
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === "OperationDefinition" && operation === "subscription";
    },
    wsLink,
    httpLink
  );

  const client = new ApolloClient({
    cache,
    link: ApolloLink.from([authMiddleware, terminatingLink]),
  });

  const initStore = () => {
    cache.writeQuery({
      query: CACHE_QUERY,
      data: defaults,
    });
  };

  initStore();

  client.onResetStore(initStore);

  return client;
}
