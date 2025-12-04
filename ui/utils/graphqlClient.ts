import { GraphQLClient } from "graphql-request";
const graphqlClient = new GraphQLClient(
  `https://api.opencollective.com/graphql/v2/${process.env.OPENCOLLECTIVE_API_KEY}`
);

export const customOCGqlClient = (token: string) => {
  return new GraphQLClient(
    `https://api.opencollective.com/graphql/v2/${token}`
  );
};

export default graphqlClient;
