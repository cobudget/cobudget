import { useState } from "react";
import { Modal } from "@material-ui/core";
import { useMutation, gql } from "@apollo/client";

import Button from "components/Button";
import TextField from "components/TextField";
import Switch from "components/Switch";
import thousandSeparator from "utils/thousandSeparator";

const BULK_ALLOCATE_MUTATION = gql`
  mutation BulkAllocate($eventId: ID!, $amount: Int!, $type: AllocationType!) {
    bulkAllocate(eventId: $eventId, amount: $amount, type: $type) {
      id
      balance
    }
  }
`;

const BulkAllocateModal = ({ event, handleClose }) => {
  const [inputValue, setInputValue] = useState("");
  const [type, setSelectedType] = useState("Add");
  const amount = Math.round(inputValue * 100);

  const [bulkAllocate, { loading }] = useMutation(BULK_ALLOCATE_MUTATION, {
    variables: { eventId: event.id, amount, type: type.toUpperCase() },
  });

  const disabled = inputValue === "" || (!amount && type === "Add");
  const total = amount * event.numberOfApprovedMembers;
  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-sm">
        <h1 className="text-xl font-semibold mb-4 break-words">
          Manage all members balance
        </h1>
        <Switch
          options={["Add", "Set"]}
          setSelected={setSelectedType}
          selected={type}
          className="mx-auto"
        />
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
            className="w-36 mx-auto mt-4 mb-2"
          />
          {type === "Add" ? (
            <p className="text-center mb-4 text-gray-700 text-sm">
              Adding {thousandSeparator(amount / 100)} {event.currency} to{" "}
              {event.numberOfApprovedMembers} members ={" "}
              {thousandSeparator(total / 100)} {event.currency} total
            </p>
          ) : (
            <p className="text-center mb-4 text-gray-700 text-sm">
              Setting {event.numberOfApprovedMembers} members balances to{" "}
              {thousandSeparator(amount / 100)} {event.currency}
            </p>
          )}

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
