import { useQuery, gql } from "urql";
import Link from "next/link";

import thousandSeparator from "utils/thousandSeparator";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import LoadMore from "components/LoadMore";
dayjs.extend(LocalizedFormat);

export const CONTRIBUTIONS_QUERY = gql`
  query Contributions($collectionId: ID!, $offset: Int, $limit: Int) {
    contributionsPage(
      collectionId: $collectionId
      offset: $offset
      limit: $limit
    ) {
      moreExist
      contributions(
        collectionId: $collectionId
        offset: $offset
        limit: $limit
      ) {
        id
        amount
        createdAt
        collectionMember {
          id
          user {
            id
            username
          }
        }
        bucket {
          id
          title
        }
      }
    }
  }
`;

const Contributions = ({ collection }) => {
  const [
    {
      data: { contributionsPage: { moreExist, contributions } } = {
        contributionsPage: { contributions: [], moreExist: false },
      },
      fetching: loading,
    },
  ] = useQuery({
    query: CONTRIBUTIONS_QUERY,
    variables: { collectionId: collection.id, offset: 0, limit: 15 },
  });

  return (
    <>
      <div className="page">
        <div className="flex justify-between mb-3 items-center">
          <h2 className="text-xl font-semibold">
            {contributions.length == 0 ? 0 : "All"} transactions
          </h2>
        </div>
        {!!contributions.length && (
          <div className="bg-white divide-y-default divide-gray-200 py-1 rounded shadow">
            {contributions.map((c) => (
              <div
                className="px-4 py-2 text-gray-800 flex items-center justify-between text-sm"
                key={c.id}
              >
                <div>
                  <span className="text-gray-500 mr-4">
                    {dayjs(c.createdAt).format("LLL")}
                  </span>
                  @{c.collectionMember.user.username} funded{" "}
                  <Link href={`/${collection.slug}/${c.bucket.id}`}>
                    <a className="font-semibold hover:underline">
                      {c.bucket.title}
                    </a>
                  </Link>
                </div>
                <span className="text-green-700 font-semibold">
                  {thousandSeparator(c.amount / 100)} {collection.currency}
                </span>
              </div>
            ))}
          </div>
        )}
        {/* <LoadMore
          moreExist={moreExist}
          loading={loading}
          // onClick={() =>
          //   // fetchMore({ variables: { offset: contributions.length } })
          // }
        /> */}
      </div>
    </>
  );
};

export default Contributions;
