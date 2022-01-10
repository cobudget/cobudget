import { useQuery, gql } from "urql";
import thousandSeparator from "utils/thousandSeparator";
import Avatar from "../Avatar";

export const BUCKET_FUNDERS_QUERY = gql`
  query Funders($id: ID!) {
    bucket(id: $id) {
      id
      funders {
        id
        amount
        createdAt
        collectionMember {
          id
          user {
            id
            name
            username
          }
        }
      }
    }
  }
`;
export default function Funders({ router, collection, currentUser }) {
  const [
    {
      data: { bucket: { funders } } = { bucket: { funders: [] } },
      fetching,
      error,
    },
  ] = useQuery({
    query: BUCKET_FUNDERS_QUERY,
    variables: { id: router.query.bucket },
  });

  return (
    <div className="bg-white border-b-default">
      {funders.length ? (
        <div className="page grid gap-10 grid-cols-1 md:grid-cols-sidebar">
          <ul className="py-6 space-y-4">
            {funders.map((contribution) => (
              <li className="flex items-center space-x-3" key={contribution.id}>
                <Avatar
                  user={contribution.collectionMember.user}
                  highlighted={
                    currentUser?.id === contribution.collectionMember.user.id
                  }
                />

                <span>
                  {contribution.collectionMember.user.username} -{" "}
                  {thousandSeparator(contribution.amount / 100)}{" "}
                  {collection.currency}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="page">
          <div className="text-xl font-medium text-gray-500 py-10 text-center">
            {fetching ? "Loading..." : "No contributions yet"}
          </div>
        </div>
      )}
    </div>
  );
}
