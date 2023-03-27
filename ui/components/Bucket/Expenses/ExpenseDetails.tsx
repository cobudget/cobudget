import FormattedCurrency from "components/FormattedCurrency";
import IconButton from "components/IconButton";
import { ChevronArrowLeftIcon } from "components/Icons";
import { useRouter } from "next/router";
import React from "react";
import { FormattedMessage } from "react-intl";
import { gql, useQuery } from "urql";

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
    }
  }
`;

function ExpenseDetails({ expenseId }) {
  const router = useRouter();

  const [{ fetching, data }] = useQuery({
    query: GET_EXPENSE,
    variables: { expenseId: expenseId },
  });
  const expense = data?.expense;

  if (fetching) {
    return <>Loading...</>;
  }

  const handleBack = () => {
    router.query.expense = undefined;
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
            <tr className="bg-gray-100">
              <td className="px-4 py-2" />
              <td className="px-4 py-2" />
              <td className="px-4 py-2 font-medium">
                <FormattedMessage defaultMessage="Total" />
              </td>
              <td className="px-4 py-2">
                <FormattedCurrency value={0} currency="USD" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExpenseDetails;
