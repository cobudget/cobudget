import FormattedCurrency from "components/FormattedCurrency";
import IconButton from "components/IconButton";
import { ChevronArrowLeftIcon, EditIcon } from "components/Icons";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import { gql, useQuery } from "urql";
import dayjs from "dayjs";
import ExpenseStatus from "./ExpenseStatus";
import { Modal } from "@mui/material";
import AddEditExpense from "./AddEditExpense";
import EditReceipt from "./EditReceipt";

const GET_EXPENSE = gql`
  query GET_EXPENSE($expenseId: String!) {
    expense(id: $expenseId) {
      id
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
      submittedBy
      ocMeta {
        legacyId
      }
      ocId
      currency
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

function ExpenseDetails({ expenseId, round, currentUser }) {
  const router = useRouter();

  const [expenseToEdit, setExpenseToEdit] = useState();
  const [receiptToEdit, setReceiptToEdit] = useState();
  const [{ fetching, data }] = useQuery({
    query: GET_EXPENSE,
    variables: { expenseId: expenseId },
  });
  const expense = data?.expense;

  const total =
    expense?.receipts?.reduce((acc, receipt) => {
      return parseInt(acc || 0) + (receipt.amount || 0);
    }, 0) || 0;

  const handleBack = () => {
    delete router.query.expense;
    router.push(router);
  };

  const handleEditExpense = () => {
    setExpenseToEdit(expense);
  };

  const isSubmittedByCurrentUser =
    currentUser?.currentCollMember?.id === expense?.submittedBy;
  const canViewDetails =
    isSubmittedByCurrentUser ||
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentCollMember?.isModerator;

  if (fetching) {
    return <>Loading...</>;
  }

  const isOcExpense = !!expense?.ocId;

  return (
    <>
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
          <ExpenseStatus expense={expense} currentUser={currentUser} />
        </div>

        {/*Receipts*/}
        {canViewDetails && (
          <div className="mt-4">
            <p className="font-lg font-medium">
              <FormattedMessage defaultMessage="Receipts" />
            </p>
            {expense?.receipts?.length > 0 ? (
              <div className="mt-4 mb-8 rounded shadow overflow-hidden bg-gray-100">
                <table className="table-fixed w-full">
                  <tbody>
                    {expense?.receipts?.map((receipt) => (
                      <tr
                        className="group bg-gray-100 even:bg-white"
                        key={receipt.id}
                      >
                        <td className="px-4 py-2">
                          {receipt.attachment ? (
                            <a
                              target="_blank"
                              rel="noreferrer"
                              href={receipt.attachment}
                            >
                              📄
                            </a>
                          ) : (
                            ""
                          )}
                        </td>
                        <td className="px-4 py-2">{receipt.description}</td>
                        <td className="px-4 py-2">
                          {dayjs(new Date(receipt.date)).format("MMM DD, YYYY")}
                        </td>
                        <td className="px-4 py-2">
                          <FormattedCurrency
                            value={receipt.amount}
                            currency={expense.currency || round.currency}
                          />
                          {isSubmittedByCurrentUser && (
                            <span className="float-right opacity-0 group-hover:opacity-100">
                              <IconButton
                                onClick={() => setReceiptToEdit(receipt)}
                              >
                                <EditIcon className="h-4 w-4" />
                              </IconButton>
                            </span>
                          )}
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
                          currency={expense.currency || round.currency}
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
        )}

        {/*Recipient Details*/}
        {isSubmittedByCurrentUser && !isOcExpense && (
          <div className="mt-4 flex justify-end">
            <span className="mr-4 mt-2 text-gray-600 text-sm">
              Edit expense details
            </span>
            <IconButton onClick={handleEditExpense}>
              <EditIcon className="h-6 w-6" />
            </IconButton>
          </div>
        )}

        {isOcExpense ? null : (
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
                    <FormattedCurrency
                      value={total}
                      currency={round.currency}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {isOcExpense && (
          <a
            target="_blank"
            href={
              round?.ocCollective?.parent
                ? `https://opencollective.com/${round?.ocCollective?.parent?.slug}/projects/${round?.ocCollective?.slug}/expenses/${expense?.ocMeta?.legacyId}`
                : `https://opencollective.com/${round?.ocCollective?.slug}/expenses/${expense?.ocMeta?.legacyId}`
            }
            rel="noreferrer"
          >
            <p className="text-sm italic text-gray-500">
              <FormattedMessage defaultMessage="See this expense on Open Collective" />
            </p>
          </a>
        )}
      </div>
      <Modal
        open={!!expenseToEdit}
        onClose={() => setExpenseToEdit(undefined)}
        className="flex items-center justify-center p-4"
      >
        <AddEditExpense
          round={round}
          bucketId={
            expenseToEdit
              ? (expenseToEdit as { bucketId: string }).bucketId
              : undefined
          }
          expenseToEdit={expenseToEdit}
          close={() => setExpenseToEdit(undefined)}
        />
      </Modal>
      <Modal
        open={!!receiptToEdit}
        onClose={() => setReceiptToEdit(undefined)}
        className="flex items-center justify-center p-4"
      >
        <EditReceipt
          receiptToEdit={receiptToEdit}
          close={() => setReceiptToEdit(undefined)}
          round={round}
        />
      </Modal>
    </>
  );
}

export default ExpenseDetails;
