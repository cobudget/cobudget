import FormattedCurrency from "components/FormattedCurrency";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { FormattedMessage } from "react-intl";
import ExpenseStatus from "./ExpenseStatus";

function ExpenseTable({ expenses, round, currentUser }) {
  const { pathname, query } = useRouter();

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
          {expenses.map((expense) => (
            <tr className="bg-gray-100 even:bg-white" key={expense.id}>
              <td className="px-4 py-2">
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
              </td>
              <td className="px-4 py-2 flex gap-2">
                <FormattedCurrency
                  value={expense.amount}
                  currency={round.currency}
                />
                <ExpenseStatus expense={expense} currentUser={currentUser} />
              </td>
            </tr>
          ))}
          <tr className="bg-gray-200 border-t-2 border-gray-300 font-medium">
            <td className="px-4 py-2">
              <FormattedMessage defaultMessage="Total" />
            </td>
            <td className="px-4 py-2">
              <FormattedCurrency value={total} currency={round.currency} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseTable;
