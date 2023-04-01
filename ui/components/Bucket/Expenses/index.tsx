import { Modal } from "@material-ui/core";
import Button from "components/Button";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import AddExpense from "./AddExpense";
import ExpenseDetails from "./ExpenseDetails";
import ExpenseTable from "./ExpenseTable";

function Expenses({ bucket, round }) {
  const router = useRouter();
  const [openAdd, setOpenAdd] = useState(false);

  return (
    <>
      <div className="bg-white border-b-default">
        <div className="page grid gap-10 grid-cols-1 md:grid-cols-sidebar">
          <div>
            <div className="flex">
              <Button onClick={() => setOpenAdd(true)}>
                <FormattedMessage defaultMessage="Submit Expense" />
              </Button>
            </div>
            {router.query.expense ? (
              <ExpenseDetails expenseId={router.query.expense} round={round} />
            ) : (
              <div className="my-4">
                <p className="font-lg font-medium">
                  <FormattedMessage defaultMessage="Expenses" />
                </p>
                <div className="my-2 mb-8 rounded shadow overflow-hidden bg-gray-100">
                  <ExpenseTable expenses={bucket.expenses} round={round} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={openAdd}
        className="flex items-center justify-center p-4"
        onClose={() => setOpenAdd(false)}
      >
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
