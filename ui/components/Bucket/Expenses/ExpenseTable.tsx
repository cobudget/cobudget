import FormattedCurrency from "components/FormattedCurrency";
import { LoaderIcon } from "components/Icons";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { gql, useQuery } from "urql";
import ExpenseStatus from "./ExpenseStatus";

const CONVERT_CURRENCY = gql`
  query ConvertCurrency(
    $amounts: [AmountConversionInput]!
    $toCurrency: String!
  ) {
    convertCurrency(amounts: $amounts, toCurrency: $toCurrency)
  }
`;

function ExpenseTable({ expenses, round, currentUser }) {
  const { pathname, query } = useRouter();

  const partialTotal = useMemo(() => {
    const sums = {};
    expenses.forEach((e) => {
      const currency = e.currency || round.currency;
      if (sums[currency]) {
        sums[currency] += e.amount;
      } else {
        sums[currency] = e.amount;
      }
    });
    return Object.keys(sums).map((key) => ({
      currency: key,
      amount: sums[key],
    }));
  }, [expenses, round]);
  const pauseConversion =
    partialTotal.length === 0 ||
    (partialTotal.length === 1 &&
      partialTotal[0]?.currency === round?.currency);

  const [{ fetching: converting, data: convertedTotal }] = useQuery({
    query: CONVERT_CURRENCY,
    pause: pauseConversion,
    variables: {
      amounts: partialTotal,
      toCurrency: round.currency,
    },
  });

  const total =
    expenses.reduce((acc, expense) => {
      return parseInt(acc || 0) + (expense.amount || 0);
    }, 0) || 0;

  if (expenses.length === 0) {
    return (
      <p className="my-2 text-gray-400">
        <FormattedMessage defaultMessage="This bucket does not have any expense" />
      </p>
    );
  }

  return (
    <div className="my-2 mb-8 rounded shadow overflow-hidden bg-gray-100">
      <table className="table-fixed w-full">
        <tbody>
          {expenses.map((expense) => {
            const canViewDetails =
              currentUser?.currentCollMember?.isAdmin ||
              currentUser?.currentCollMember?.isModerator ||
              currentUser?.currentCollMember?.id === expense?.submittedBy;
            return (
              <tr className="bg-gray-100 even:bg-white" key={expense.id}>
                <td className="px-4 py-2">
                  {canViewDetails ? (
                    <Link
                      href={{
                        pathname: pathname,
                        query: { ...query, expense: expense.id },
                      }}
                      passHref
                      shallow
                      replace
                    >
                      <span className="underline cursor-pointer">
                        {expense.title}
                      </span>
                    </Link>
                  ) : (
                    <span>{expense.title}</span>
                  )}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <FormattedCurrency
                    value={expense.amount}
                    currency={expense.currency || round.currency}
                  />
                  <ExpenseStatus expense={expense} currentUser={currentUser} />
                </td>
              </tr>
            );
          })}
          <tr className="bg-gray-200 border-t-2 border-gray-300 font-medium">
            <td className="px-4 py-2">
              <FormattedMessage defaultMessage="Total" />
            </td>
            <td className="px-4 py-2">
              {converting ? (
                <LoaderIcon className="animate-spin" width={20} height={20} />
              ) : (
                <FormattedCurrency
                  value={convertedTotal?.convertCurrency || total}
                  currency={round.currency}
                />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseTable;
