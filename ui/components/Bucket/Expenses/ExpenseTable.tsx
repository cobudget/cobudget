import FormattedCurrency from "components/FormattedCurrency";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

function ExpenseTable({ expenses, round }) {
  const { pathname, query } = useRouter();

  return (
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
                <span className="underline">{expense.title}</span>
              </Link>
            </td>
            <td className="px-4 py-2">
              <FormattedCurrency
                value={expense.amount}
                currency={round.currency}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ExpenseTable;
