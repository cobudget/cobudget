import { GraphQLClient } from "graphql-request";
const graphqlClient = new GraphQLClient(
  `https://api.opencollective.com/graphql/v2/${process.env.OPENCOLLECTIVE_API_KEY}`
);
export default graphqlClient;
