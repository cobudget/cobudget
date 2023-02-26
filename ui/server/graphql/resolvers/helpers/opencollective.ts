import graphqlClient from "utils/graphqlClient";

export const GET_COLLECTIVE = `
    query ($slug: String, $id: String){
        collective (slug:$slug, id: $id) {
          id
          slug
          name
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
