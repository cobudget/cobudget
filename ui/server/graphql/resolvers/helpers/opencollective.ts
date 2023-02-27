import graphqlClient from "utils/graphqlClient";

export const GET_COLLECTIVE = `
    query ($slug: String, $id: String){
        collective (slug:$slug, id: $id) {
          id
          slug
          name
          type
          stats {
                balance {
                    currency
                    valueInCents
                }
            }
        }
    }
`;

export const GET_PROJECT = `
    query ($slug: String, $id: String) {
        project (slug:$slug, id: $id) {
          id
          slug
          name
          type
          parent {
            id
            name
            slug
          }
          stats {
                balance {
                    currency
                    valueInCents
                }
            }
        }
    }
`;

export const getCollective = async (filter: { slug?: string; id?: string }) => {
  try {
    const response = await graphqlClient.request(GET_COLLECTIVE, filter);
    return response.collective;
  } catch (err) {
    return null;
  }
};

export const getProject = async (filter: { slug?: string; id?: string }) => {
  try {
    const response = await graphqlClient.request(GET_PROJECT, filter);
    return response.project;
  } catch (err) {
    return null;
  }
};
