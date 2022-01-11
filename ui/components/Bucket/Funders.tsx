import { useQuery, gql } from "urql";
import thousandSeparator from "utils/thousandSeparator";
import Avatar from "../Avatar";

export default function Funders({ bucket, collection, currentUser }) {
  return (
    <div className="bg-white border-b-default">
      {bucket.funders.length ? (
        <div className="page grid gap-10 grid-cols-1 md:grid-cols-sidebar">
          <ul className="py-6 space-y-4">
            {bucket.funders.map((contribution) => (
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
            {"No contributions yet"}
          </div>
        </div>
      )}
    </div>
  );
}
