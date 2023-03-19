import { Modal } from "@material-ui/core";
import Button from "components/Button";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import AddExpense from "./AddExpense";

function Expenses({ bucketId }) {

  const [openAdd, setOpenAdd] = useState(false);

  return (
    <>
      <div className="bg-white border-b-default">
        <div className="page grid gap-10 grid-cols-1 md:grid-cols-sidebar">
          <div className="flex">
            <Button onClick={() => setOpenAdd(true)}>
              <FormattedMessage defaultMessage="Submit Expense" />
            </Button>
          </div>
        </div>
      </div>

      <Modal 
        open={openAdd} 
        className="flex items-center justify-center p-4"
        onClose={() => setOpenAdd(false)}
      >
        <AddExpense bucketId={bucketId} close={() => setOpenAdd(false)} />
      </Modal>
    </>
  );
}

export default Expenses;
