import { useState } from "react";
import { Modal } from "@material-ui/core";
import { useMutation, gql } from "@apollo/client";

import Button from "components/Button";
import TextField from "components/TextField";
import thousandSeparator from "utils/thousandSeparator";

const BULK_ALLOCATE_MUTATION = gql`
  mutation BulkAllocate($eventId: ID!, $amount: Int!) {
    bulkAllocate(eventId: $eventId, amount: $amount) {
      id
      balance
    }
  }
`;

const BulkAllocateModal = ({ event, handleClose }) => {
  const [inputValue, setInputValue] = useState("");
  const amount = Math.round(inputValue * 100);

  const [bulkAllocate, { loading }] = useMutation(BULK_ALLOCATE_MUTATION, {
    variables: { eventId: event.id, amount },
  });

  const disabled = !amount;
  const total = amount * event.numberOfApprovedMembers;
  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-xs">
        <h1 className="text-xl font-semibold mb-4 break-words">
          Add to all members balance
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            bulkAllocate()
              .then(() => handleClose())
              .catch((err) => alert(err.message));
          }}
        >
          <TextField
            inputProps={{
              value: inputValue,
              onChange: (e) => setInputValue(e.target.value),
              type: "number",
            }}
            placeholder="0"
            autoFocus
            endAdornment={event.currency}
            className="w-36 mx-auto mb-2"
          />
          <p className="text-center mb-4 text-gray-700 text-sm">
            Allocating {thousandSeparator(amount / 100)} {event.currency} to{" "}
            {event.numberOfApprovedMembers} members <br />={" "}
            {thousandSeparator(total / 100)} {event.currency} total
          </p>
          <div className="flex space-x-3 justify-end">
            <Button onClick={handleClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={disabled}>
              Done
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BulkAllocateModal;
