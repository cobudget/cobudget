// Queries that need to be accessible to several components (for reusability, cache updates, etc.)

import { gql } from "@apollo/client";

export const CACHE_QUERY = gql`
  query ShowCreates {
    showCreateNeed @client
    showCreateResponsibility @client
    showDetailedEditNeedView @client
    showDetailedEditRespView @client
  }
`;

export const GET_NEEDS = gql`
  query Needs {
    needs {
      nodeId
      title
      fulfilledBy {
        nodeId
        title
        realizer {
          nodeId
          name
        }
      }
    }
  }
`;

export const GET_RESPONSIBILITIES = gql`
  query Responsibilities($needId: ID!) {
    responsibilities(fulfillsNeedId: $needId) {
      nodeId
      title
      realizer {
        nodeId
        name
      }
      fulfills {
        nodeId
      }
    }
  }
`;

export const GET_RESP_FULFILLS = gql`
  query GetRespFulfills($responsibilityId: ID!) {
    responsibility(nodeId: $responsibilityId) {
      nodeId
      fulfills {
        nodeId
      }
    }
  }
`;
