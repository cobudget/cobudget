import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Link from "next/link";

import { TOP_LEVEL_QUERY } from "./_app";

const PROFILE_QUERY = gql`
  query Profile {
    currentMember {
      id
      givenGrants {
        id
        value
        dream {
          title
          slug
        }
      }
    }
  }
`;

const DELETE_GRANT_MUTATION = gql`
  mutation DeleteGrant($grantId: ID!) {
    deleteGrant(grantId: $grantId) {
      id
      value
    }
  }
`;

export default ({ currentMember, event }) => {
  const { data } = useQuery(PROFILE_QUERY);

  const [deleteGrant] = useMutation(DELETE_GRANT_MUTATION, {
    update(cache, { data: { deleteGrant } }) {
      const { currentMember } = cache.readQuery({ query: PROFILE_QUERY });
      cache.writeQuery({
        query: PROFILE_QUERY,
        data: {
          currentMember: {
            ...currentMember,
            givenGrants: currentMember.givenGrants.filter(
              grant => grant.id !== deleteGrant.id
            )
          }
        }
      });

      const topLevelQueryData = cache.readQuery({
        query: TOP_LEVEL_QUERY,
        variables: { slug: event.slug }
      });

      cache.writeQuery({
        query: TOP_LEVEL_QUERY,
        data: {
          ...topLevelQueryData,
          currentMember: {
            ...topLevelQueryData.currentMember,
            availableGrants:
              topLevelQueryData.currentMember.availableGrants +
              deleteGrant.value
          }
        }
      });
    }
  });

  return (
    <div>
      <h3>Given grants</h3>
      <ul>
        {data &&
          data.currentMember.givenGrants.map(grant => (
            <li key={grant.id}>
              <Link href="/[dream]" as={`/${grant.dream.slug}`}>
                <a>{grant.dream.title}</a>
              </Link>{" "}
              - {grant.value} grants -{" "}
              <button
                onClick={() =>
                  deleteGrant({ variables: { grantId: grant.id } })
                }
              >
                Remove
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};
