import { useQuery, gql } from "urql";
import Link from "next/link";

import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import LoadMore from "components/LoadMore";
import { FormattedMessage, useIntl, FormattedNumber } from "react-intl";
import FormattedCurrency from "components/FormattedCurrency";
dayjs.extend(LocalizedFormat);

export const TRANSACTIONS_QUERY = gql`
  query Transactions($roundId: ID!, $offset: Int, $limit: Int) {
    roundTransactions(roundId: $roundId, offset: $offset, limit: $limit) {
      moreExist
      transactions(roundId: $roundId, offset: $offset, limit: $limit) {
        id
        amount
        amountBefore
        createdAt
        allocationType
        transactionType
        roundMember {
          id
          user {
            id
            username
          }
        }
        allocatedBy {
          id
          user {
            id
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

const Transactions = ({ round, currentGroup }) => {
  const intl = useIntl();
  const [
    {
      data: { roundTransactions: { moreExist, transactions } } = {
        roundTransactions: { transactions: [], moreExist: false },
      },
      fetching,
    },
  ] = useQuery({
    query: TRANSACTIONS_QUERY,
    variables: { roundId: round.id, offset: 0, limit: 500 },
  });

  return (
    <>
      <div className="page">
        <div className="flex justify-between mb-3 items-center">
          <h2 className="text-xl font-semibold">
            {transactions.length === 0 ? (
              <FormattedMessage defaultMessage="0 transactions" />
            ) : (
              <FormattedMessage defaultMessage="All transactions" />
            )}
          </h2>
        </div>
        {!!transactions.length && (
          <div className="bg-white divide-y-default divide-gray-200 py-1 rounded shadow">
            {transactions.map((c) => {
              const showBalance = c.amountBefore !== null;
              return c.transactionType === "CONTRIBUTION" ? (
                <div
                  className="px-4 py-2 text-gray-800 flex items-center justify-between text-sm"
                  key={c.id}
                >
                  <div>
                    <span className="text-gray-500 mr-4">
                      {dayjs(c.createdAt).format("LLL")}
                    </span>
                    <FormattedMessage
                      defaultMessage="@{username} funded {m} to <a></a>"
                      values={{
                        username: c.roundMember.user.username,
                        a: () => (
                          <Link
                            href={`/${currentGroup?.slug ?? "c"}/${
                              round.slug
                            }/${c.bucket?.id}`}
                          >
                            <a className="font-semibold hover:underline">
                              {c.bucket?.title}
                            </a>
                          </Link>
                        ),
                        m: intl.formatNumber(c.amount / 100, {
                          style: "currency",
                          currencyDisplay: "symbol",
                          currency: round.currency,
                        }),
                      }}
                    />
                  </div>
                  {showBalance && (
                    <span>
                      <span className="block text-right">
                        <p className="text-green-700 font-semibold">
                          <FormattedNumber
                            value={(c.amountBefore + c.amount) / 100}
                            style="currency"
                            currencyDisplay={"symbol"}
                            currency={round.currency}
                          />
                        </p>
                        <p className="text-xxs text-slate-100 font-semibold">
                          <FormattedMessage defaultMessage="Bucket balance" />
                        </p>
                      </span>
                    </span>
                  )}
                </div>
              ) : (
                <div
                  className="px-4 py-2 text-gray-800 flex items-center justify-between text-sm"
                  key={c.id}
                >
                  <div>
                    <span className="text-gray-500 mr-4">
                      {dayjs(c.createdAt).format("LLL")}
                    </span>
                    {c.allocatedBy
                      ? `@${c.allocatedBy.user.username}`
                      : intl.formatMessage({ defaultMessage: "Admin" })}

                    {c.allocationType === "ADD" ? (
                      <>
                        {" "}
                        {c.amount < 0
                          ? intl.formatMessage({ defaultMessage: "deducted" })
                          : intl.formatMessage({
                              defaultMessage: "added",
                            })}{" "}
                        <FormattedCurrency
                          value={c.amount}
                          currency={round.currency}
                        />{" "}
                        {c.amount < 0
                          ? intl.formatMessage({ defaultMessage: "from" })
                          : intl.formatMessage({ defaultMessage: "to" })}{" "}
                        @
                        <FormattedMessage
                          defaultMessage="{username}'s balance"
                          values={{
                            username: c.roundMember.user.username,
                          }}
                        />
                      </>
                    ) : (
                      <>
                        {" "}
                        <FormattedMessage
                          defaultMessage="set @{username}'s balance to {m}"
                          values={{
                            username: c.roundMember.user.username,
                            m: intl.formatNumber(
                              (c.amount + c.amountBefore) / 100,
                              {
                                style: "currency",
                                currencyDisplay: "symbol",
                                currency: round.currency,
                              }
                            ),
                          }}
                        />
                      </>
                    )}
                  </div>
                  {showBalance && (
                    <span className="block text-right">
                      <p className="text-green-700 font-semibold">
                        <FormattedNumber
                          value={(c.amount + c.amountBefore) / 100}
                          style="currency"
                          currencyDisplay={"symbol"}
                          currency={round.currency}
                        />{" "}
                      </p>
                      <p className="text-xxs text-slate-100 font-semibold">
                        <FormattedMessage defaultMessage="User balance" />
                      </p>
                    </span>
                  )}
                </div>
              );
            })}
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

export default Transactions;
