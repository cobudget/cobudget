// Subscriptions that need to be accessible to several components

import { gql } from "@apollo/client";

export const REALITIES_CREATE_SUBSCRIPTION = gql`
  subscription realityCreated {
    realityCreated {
      title
      nodeId
      ... on Need {
        fulfilledBy {
          nodeId
          title
          realizer {
            nodeId
            name
          }
        }
      }
      ... on Responsibility {
        realizer {
          nodeId
          name
        }
        fulfills {
          nodeId
        }
      }
    }
  }
`;

export const REALITIES_DELETE_SUBSCRIPTION = gql`
  subscription realityDeleted {
    realityDeleted {
      nodeId
      title
      guide {
        email
      }
      description
    }
  }
`;

export const REALITIES_UPDATE_SUBSCRIPTION = gql`
  subscription realityUpdated {
    realityUpdated {
      nodeId
      title
      description
      guide {
        nodeId
        email
        name
      }
      ... on Responsibility {
        realizer {
          nodeId
          email
          name
        }
        dependsOnResponsibilities {
          nodeId
          title
          fulfills {
            nodeId
          }
        }
        responsibilitiesThatDependOnThis {
          nodeId
          title
          fulfills {
            nodeId
          }
        }
        deliberations {
          nodeId
          url
          title
        }
      }
      ... on Need {
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
  }
`;
