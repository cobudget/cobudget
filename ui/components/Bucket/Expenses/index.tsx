import { Modal } from "@material-ui/core";
import Button from "components/Button";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import AddExpense from "./AddEditExpense";
import ExpenseDetails from "./ExpenseDetails";
import ExpenseTable from "./ExpenseTable";
import RequestedFundingTable from "../RequestedFundingTable";
import FormattedCurrency from "components/FormattedCurrency";

function Expenses({ bucket, round, currentUser }) {
  const router = useRouter();
  const [openAdd, setOpenAdd] = useState(false);

  const handleSubmitExpense = async () => {
    if (round.ocCollective) {
      window.open(
        `http://opencollective.com/${
          round.ocCollective.slug
        }/expenses/new?customData=${JSON.stringify({
          b: bucket.id,
          u: currentUser?.currentCollMember?.id,
        })}`,
        "_blank"
      );
    } else {
      setOpenAdd(true);
    }
  };

  return (
    <>
      <div className="bg-white border-b-default">
        <div className="page grid gap-10 grid-cols-1 md:grid-cols-sidebar">
          <div>
            {bucket?.cocreators.find(
              (c) => c.id === currentUser?.currentCollMember?.id
            ) && (
              <div className="flex">
                <Button onClick={handleSubmitExpense}>
                  <FormattedMessage defaultMessage="Submit Expense" />
                </Button>
              </div>
            )}
            {router.query.expense ? (
              <ExpenseDetails
                expenseId={router.query.expense}
                round={round}
                currentUser={currentUser}
              />
            ) : (
              <div className="my-4">
                <p className="text-2xl font-medium">
                  <FormattedMessage defaultMessage="Expenses" />
                </p>
                <ExpenseTable
                  expenses={bucket.expenses}
                  round={round}
                  currentUser={currentUser}
                  rejected={false}
                />
                <p className="font-lg font-medium">
                  <FormattedMessage defaultMessage="Rejected" />
                </p>
                <ExpenseTable
                  expenses={bucket.expenses}
                  round={round}
                  currentUser={currentUser}
                  rejected={true}
                />
              </div>
            )}
            <div className="my-4">
              <p className="text-2xl font-medium">
                <FormattedMessage defaultMessage="Budget" />
              </p>
              <div className="my-2">
                <RequestedFundingTable round={round} bucket={bucket} />
              </div>
            </div>
            <div className="my-2">
              <p className="text-lg font-bold">
                <FormattedMessage defaultMessage="Received Funding" />
                <span className="float-right">
                  <FormattedCurrency
                    value={bucket.totalContributions}
                    currency={round.currency}
                  />
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal open={openAdd} className="flex items-center justify-center p-4">
        <AddExpense
          bucketId={bucket.id}
          round={round}
          close={() => setOpenAdd(false)}
        />
      </Modal>
    </>
  );
}

export default Expenses;
