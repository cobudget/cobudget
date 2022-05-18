import { useState } from "react";
import { Modal } from "@material-ui/core";
import { useMutation, gql } from "urql";

import Button from "components/Button";
import TextField from "components/TextField";
import Switch from "components/Switch";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl, FormattedNumber } from "react-intl"; 

const BULK_ALLOCATE_MUTATION = gql`
  mutation BulkAllocate($roundId: ID!, $amount: Int!, $type: AllocationType!) {
    bulkAllocate(roundId: $roundId, amount: $amount, type: $type) {
      id
      balance
    }
  }
`;

const BulkAllocateModal = ({ round, handleClose }) => {
  const [inputValue, setInputValue] = useState("");
  const [type, setSelectedType] = useState("Add");
  const amount = Math.round(Number(inputValue) * 100);
  const intl = useIntl();

  const [{ fetching: loading }, bulkAllocate] = useMutation(
    BULK_ALLOCATE_MUTATION
  );

  const disabled = inputValue === "" || (!amount && type === "Add");
  const total = amount * round.numberOfApprovedMembers;
  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-sm">
        <h1 className="text-xl font-semibold mb-4 break-words">
          <FormattedMessage defaultMessage="Manage all members balance" />
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
            bulkAllocate({
              roundId: round.id,
              amount,
              type: type.toUpperCase(),
            }).then(({ error }) => {
              if (error) {
                toast.error(error.message);
              } else {
                handleClose();
                toast.success(
                  intl.formatMessage({ defaultMessage:"Allocated funds successfully"})
                );
              }
            });
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
            endAdornment={round.currency}
            className="w-36 mx-auto mt-4 mb-2"
          />
          {type === "Add" ? (
            <p className="text-center mb-4 text-gray-700 text-sm">
              <FormattedMessage defaultMessage="Adding" />{" "}
              <FormattedNumber
                value={amount / 100}
                style="currency"
                currencyDisplay={"symbol"}
                currency={round.currency}
              /> {" "}
              <FormattedMessage 
                defaultMessage=" to {count} {count, plural, one {member} other {members}}"
                values={{
                  count: round.numberOfApprovedMembers,
                }}
              />
            </p>
          ) : (
            <p className="text-center mb-4 text-gray-700 text-sm">
              <FormattedMessage 
                defaultMessage="Setting {count} {count, plural, one {member} other {members}} {count, plural, one {balance} other {balances}} to" 
                values={{
                  count: round.numberOfApprovedMembers
                }}
              />{" "}
              <FormattedNumber
                value={amount / 100}
                style="currency"
                currencyDisplay={"symbol"}
                currency={round.currency}
              />
            </p>
          )}

          <div className="flex space-x-3 justify-end">
            <Button onClick={handleClose} variant="secondary">
            <FormattedMessage defaultMessage="Cancel" />
            </Button>
            <Button type="submit" loading={loading} disabled={disabled}>
            <FormattedMessage defaultMessage="Done" />
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BulkAllocateModal;
