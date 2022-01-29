import { useQuery, gql } from "urql";
import Link from "next/link";

import thousandSeparator from "utils/thousandSeparator";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import LoadMore from "components/LoadMore";
dayjs.extend(LocalizedFormat);

export const TRANSACTIONS_QUERY = gql`
  query Contributions($collectionId: ID!, $offset: Int, $limit: Int) {
    collectionTransactions(
      collectionId: $collectionId
      offset: $offset
      limit: $limit
    ) {
      moreExist
      transactions(
        collectionId: $collectionId
        offset: $offset
        limit: $limit
      ) {
        id
        amount
        amountBefore
        createdAt
        allocationType
        transactionType
        collectionMember {
          id
          user {
            id
            username
          }
        }
        allocatedBy {
          user {
            username
          }
        }
        bucket {
          id
          title
          totalContributions
        }
      }
    }
  }
`;

const Contributions = ({ collection, currentOrg }) => {
  const [
    {
      data: { collectionTransactions: { moreExist, transactions } } = {
        collectionTransactions: { transactions: [], moreExist: false },
      },
      fetching: loading,
    },
  ] = useQuery({
    query: TRANSACTIONS_QUERY,
    variables: { collectionId: collection.id, offset: 0, limit: 500 },
  });

  return (
    <>
      <div className="page">
        <div className="flex justify-between mb-3 items-center">
          <h2 className="text-xl font-semibold">
            {transactions.length == 0 ? 0 : "All"} transactions
          </h2>
        </div>
        {!!transactions.length && (
          <div className="bg-white divide-y-default divide-gray-200 py-1 rounded shadow">
            {transactions.map((c) => 
              c.transactionType === "CONTRIBUTION" ? (
              <div
                className="px-4 py-2 text-gray-800 flex items-center justify-between text-sm"
                key={c.id}
              >
                <div>
                  <span className="text-gray-500 mr-4">
                    {dayjs(c.createdAt).format("LLL")}
                  </span>
                  @{c.collectionMember.user.username} funded{" "}
                  {thousandSeparator((c.amount) / 100)} {collection.currency} to {" "}
                  <Link
                    href={`/${currentOrg?.slug ?? "c"}/${collection.slug}/${
                      c.bucket?.id
                    }`}
                  >
                    <a className="font-semibold hover:underline">
                      {c.bucket?.title}
                    </a>
                  </Link>
                </div>
                <span>
                <span className="block text-right">
                  <p className="text-green-700 font-semibold">
                    {thousandSeparator((c.amountBefore + c.amount) / 100)} {collection.currency}
                  </p>
                  <p className="text-xxs text-slate-100 font-semibold">
                    Bucket Balance
                  </p>
                </span>
                </span>
              </div>
            ):
            (
              <div
                className="px-4 py-2 text-gray-800 flex items-center justify-between text-sm"
                key={c.id}
              >
                <div>
                <span className="text-gray-500 mr-4">
                  {dayjs(c.createdAt).format("LLL")}
                </span>
                @{c.allocatedBy.user.username}
                {
                  c.allocationType === "ADD" ?
                  (
                    <>
                      { c.amount < 0 ? " deducted " : " added " } 
                      { Math.abs(thousandSeparator(c.amount / 100)) } 
                      {" "}
                      {collection.currency} 
                      { c.amount < 0 ? " from " : " to " }
                      @{c.collectionMember.user.username}
                      {" "}balance
                    </>
                  ) :
                  (
                    <>
                      {" "}
                      set
                      {" "}
                      @{c.collectionMember.user.username}'s
                      {" "} balance to {" "}
                      { Math.abs(thousandSeparator((c.amount + c.amountBefore) / 100)) } 
                      {" "}
                      {collection.currency}
                    </>
                  )
                }
                </div>
                <span className="block text-right">
                  <p className="text-green-700 font-semibold">
                    {thousandSeparator((c.amount + c.amountBefore) / 100)} {collection.currency}
                  </p>
                  <p className="text-xxs text-slate-100 font-semibold">
                    User Balance
                  </p>
                </span>
              </div>
            )
            )}
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
