import { Modal } from "@material-ui/core";
import Button from "components/Button";
import React from "react";
import { FormattedMessage } from "react-intl";
import AddExpense from "./AddExpense";

function Expenses() {
  return (
    <>
      <div className="bg-white border-b-default">
        <div className="page grid gap-10 grid-cols-1 md:grid-cols-sidebar">
          <div className="flex">
            <Button>
              <FormattedMessage defaultMessage="Submit Expense" />
            </Button>
          </div>
        </div>
      </div>

      <Modal open={true} className="flex items-center justify-center p-4">
        <AddExpense />
      </Modal>
    </>
  );
}

export default Expenses;
