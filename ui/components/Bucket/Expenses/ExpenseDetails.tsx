import FormattedCurrency from "components/FormattedCurrency";
import IconButton from "components/IconButton";
import { ChevronArrowLeftIcon } from "components/Icons";
import { useRouter } from "next/router";
import React from "react";
import { FormattedMessage } from "react-intl";
import { gql, useQuery } from "urql";
import dayjs from "dayjs";
import ExpenseStatus from "./ExpenseStatus";

const GET_EXPENSE = gql`
  query GET_EXPENSE($expenseId: String!) {
    expense(id: $expenseId) {
      title
      recipientName
      recipientEmail
      swiftCode
      amount
      iban
      country
      city
      recipientAddress
      recipientPostalCode
      status
      receipts {
        id
        description
        date
        amount
        attachment
      }
    }
  }
`;

function ExpenseDetails({ expenseId, round }) {
  const router = useRouter();

  const [{ fetching, data }] = useQuery({
    query: GET_EXPENSE,
    variables: { expenseId: expenseId },
  });
  const expense = data?.expense;

  if (fetching) {
    return <>Loading...</>;
  }

  const total =
    expense?.receipts?.reduce((acc, receipt) => {
      return parseInt(acc?.amount || 0) + (receipt.amount || 0);
    }, 0) || 0;

  const handleBack = () => {
    delete router.query.expense;
    router.push(router);
  };

  return (
    <div>
      <div className="flex mt-4 font-lg text-xl font-medium">
        <span>
          <IconButton onClick={handleBack}>
            <ChevronArrowLeftIcon />
          </IconButton>
        </span>
        <p className="ml-2 mt-0.5">{expense?.title}</p>
      </div>

      <div className="mt-4 flex">
        <ExpenseStatus expense={expense} />
      </div>

      {/*Receipts*/}
      <div className="mt-4">
        <p className="font-lg font-medium">
          <FormattedMessage defaultMessage="Receipts" />
        </p>
        {expense?.receipts?.length > 0 ? (
          <div className="mt-4 mb-8 rounded shadow overflow-hidden bg-gray-100">
            <table className="table-fixed w-full">
              <tbody>
                {expense?.receipts?.map((receipt) => (
                  <tr className="bg-gray-100 even:bg-white" key={receipt.id}>
                    <td className="px-4 py-2">📄</td>
                    <td className="px-4 py-2">{receipt.description}</td>
                    <td className="px-4 py-2">
                      {dayjs(new Date(receipt.date)).format("MMM DD, YYYY")}
                    </td>
                    <td className="px-4 py-2">
                      <FormattedCurrency
                        value={receipt.amount}
                        currency={round.currency}
                      />
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-200">
                  <td />
                  <td />
                  <td className="px-4 py-2 font-medium">Total</td>
                  <td className="px-4 py-2">
                    <FormattedCurrency
                      value={total}
                      currency={round.currency}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="my-2 text-gray-400">
            <FormattedMessage defaultMessage="The expense does not have a receipt" />
          </p>
        )}
      </div>

      {/*Recipient Details*/}
      <div className="mt-4 mb-8 rounded shadow overflow-hidden bg-gray-100">
        <table className="table-fixed w-full">
          <tbody>
            <tr className="bg-gray-100">
              <td className="px-4 py-2 font-medium">
                <FormattedMessage defaultMessage="Name" />
              </td>
              <td className="px-4 py-2">{expense?.recipientName}</td>
              <td className="px-4 py-2 font-medium">
                <FormattedMessage defaultMessage="Email" />
              </td>
              <td className="px-4 py-2">{expense?.recipientEmail}</td>
            </tr>
            <tr className="bg-white">
              <td className="px-4 py-2 font-medium">
                <FormattedMessage defaultMessage="BIC/SWIFT" />
              </td>
              <td className="px-4 py-2">{expense?.swiftCode}</td>
              <td className="px-4 py-2 font-medium">
                <FormattedMessage defaultMessage="IBAN" />
              </td>
              <td className="px-4 py-2">{expense?.iban}</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="px-4 py-2 font-medium">
                <FormattedMessage defaultMessage="Country" />
              </td>
              <td className="px-4 py-2">{expense?.country}</td>
              <td className="px-4 py-2 font-medium">
                <FormattedMessage defaultMessage="City" />
              </td>
              <td className="px-4 py-2">{expense?.city}</td>
            </tr>
            <tr className="bg-white">
              <td className="px-4 py-2 font-medium">
                <FormattedMessage defaultMessage="Recipient Address" />
              </td>
              <td className="px-4 py-2">{expense?.recipientAddress}</td>
              <td className="px-4 py-2 font-medium">
                <FormattedMessage defaultMessage="Postal code" />
              </td>
              <td className="px-4 py-2">{expense?.recipientPostalCode}</td>
            </tr>
            <tr className="bg-gray-200">
              <td className="px-4 py-2" />
              <td className="px-4 py-2" />
              <td className="px-4 py-2 font-medium">
                <FormattedMessage defaultMessage="Total" />
              </td>
              <td className="px-4 py-2">
                <FormattedCurrency value={total} currency={round.currency} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExpenseDetails;
