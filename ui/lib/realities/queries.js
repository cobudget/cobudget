import gql from "graphql-tag";

export const CACHE_QUERY = gql`
  query ShowCreates {
    showCreateNeed @client
    showCreateResponsibility @client
    showDetailedEditNeedView @client
    showDetailedEditRespView @client
  }
`;
