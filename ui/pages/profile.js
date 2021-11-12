import { useQuery, useMutation, gql } from "urql";
import Link from "next/link";

const PROFILE_QUERY = gql`
  query Profile {
    currentUser {
      id
      name
      bio
      memberships {
        id
        event {
          id
          title
          slug
        }
        givenGrants {
          id
          value
          dream {
            title
            slug
            event {
              id
            }
          }
        }
      }
    }
  }
`;

const DELETE_GRANT_MUTATION = gql`
  mutation DeleteGrant($eventId: ID!, $grantId: ID!) {
    deleteGrant(eventId: $eventId, grantId: $grantId) {
      id
      value
      dream {
        event {
          id
        }
      }
    }
  }
`;

export default () => {
  const [{ data }] = useQuery({ query: PROFILE_QUERY });

  const [, deleteGrant] = useMutation(
    DELETE_GRANT_MUTATION
    // update(cache, { data: { deleteGrant } }) {
    //   const { currentUser } = cache.readQuery({ query: PROFILE_QUERY });
    //   cache.writeQuery({
    //     query: PROFILE_QUERY,
    //     data: {
    //       currentUser: {
    //         ...currentUser,
    //         memberships: [
    //           ...currentUser.memberships.map((membership) => {
    //             if (membership.event.id === deleteGrant.dream.event.id) {
    //               return {
    //                 ...membership,
    //                 givenGrants: membership.givenGrants.filter(
    //                   (grant) => grant.id !== deleteGrant.id
    //                 ),
    //               };
    //             }
    //             return membership;
    //           }),
    //         ],
    //       },
    //     },
    //   });
    // const topLevelQueryData = cache.readQuery({
    //   query: TOP_LEVEL_QUERY,
    //   variables: { slug: event.slug },
    // });
    // cache.writeQuery({
    //   query: TOP_LEVEL_QUERY,
    //   data: {
    //     ...topLevelQueryData,
    //     currentMember: {
    //       ...topLevelQueryData.currentMember,
    //       availableGrants:
    //         topLevelQueryData.currentMember.availableGrants +
    //         deleteGrant.value,
    //     },
    //   },
    // });
  );

  return (
    <div>
      <h1 className="text-2xl mb-4">{data && data.currentUser.name}</h1>
      <h2 className="mb-4">
        Memberships ({data && data.currentUser.memberships.length}):
      </h2>
      {data &&
        data.currentUser.memberships.map((membership) => (
          <div key={membership.id} className="shadow bg-white mb-5 rounded p-5">
            <Link href={`/${currentOrg.slug}/${membership.event.slug}`}>
              <a>
                <h2 className="text-xl">{membership.event.title}</h2>
              </a>
            </Link>

            {membership.givenGrants.length > 0 && (
              <>
                <h3 className="text-lg mt-4">Tokens given</h3>
                <ul>
                  {membership.givenGrants.map((grant) => (
                    <li key={grant.id}>
                      <Link
                        href={`/${currentOrg.slug}/${membership.event.slug}/${grant.dream.id}`}
                      >
                        <a>{grant.dream.title}</a>
                      </Link>{" "}
                      - {grant.value} tokens -{" "}
                      <button
                        onClick={() =>
                          deleteGrant({
                            variables: {
                              grantId: grant.id,
                              eventId: membership.event.id,
                            },
                          })
                        }
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
    </div>
  );
};
