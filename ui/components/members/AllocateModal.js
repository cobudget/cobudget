import { useState } from "react";
import { Modal } from "@material-ui/core";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

import Button from "components/Button";
import TextField from "components/TextField";
import thousandSeparator from "utils/thousandSeparator";

const ALLOCATE_MUTATION = gql`
  mutation Allocate($eventMemberId: ID!, $amount: Int!) {
    allocate(eventMemberId: $eventMemberId, amount: $amount) {
      id
      balance
    }
  }
`;

const AllocateModal = ({ member, event, handleClose }) => {
  const [inputValue, setInputValue] = useState("");
  const amount = Math.round(inputValue * 100);

  const [allocate, { loading }] = useMutation(ALLOCATE_MUTATION, {
    variables: { eventMemberId: member.id, amount },
  });

  const total = amount + member.balance;
  const disabled = total < 0 || !amount;

  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-xs">
        <h1 className="text-xl font-semibold mb-4 break-words">
          Add to @{member.orgMember.user.username}'s balance
        </h1>
        <p className="text-center mb-2">
          <span>
            {thousandSeparator(member.balance / 100)} {event.currency}{" "}
          </span>{" "}
          +
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            allocate()
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
            className="w-36 mx-auto mb-2"
          />
          <p className="text-center mb-4">
            = {thousandSeparator(total / 100)} {event.currency} total
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

export default AllocateModal;
