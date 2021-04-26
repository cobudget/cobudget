import { gql } from "@apollo/client";

export const CACHE_QUERY = gql`
  query ShowCreates {
    showCreateNeed @client
    showCreateResponsibility @client
    showDetailedEditNeedView @client
    showDetailedEditRespView @client
  }
`;
