import { useState } from "react";
import { Modal } from "@material-ui/core";
import { useMutation, gql } from "urql";

import Switch from "components/Switch";
import Button from "components/Button";
import TextField from "components/TextField";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl, FormattedNumber } from "react-intl";

const ALLOCATE_MUTATION = gql`
  mutation Allocate(
    $roundMemberId: ID!
    $amount: Int!
    $type: AllocationType!
  ) {
    allocate(roundMemberId: $roundMemberId, amount: $amount, type: $type) {
      id
      balance
    }
  }
`;

const AllocateModal = ({ member, round, handleClose }) => {
  const [inputValue, setInputValue] = useState("");
  const [type, setSelectedType] = useState("Add");
  const intl = useIntl();
  const amount = Math.round(Number(inputValue) * 100);

  const [{ fetching: loading }, allocate] = useMutation(ALLOCATE_MUTATION);

  const total = amount + member.balance;
  const disabled = total < 0 || inputValue == "" || (!amount && type === "Add");

  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-xs">
        <h1 className="text-xl font-semibold mb-4 break-words">
          <FormattedMessage
            defaultMessage="Manage {name}'s balance"
            values={{
              name: member.user.username
                ? `@${member.user.username}`
                : member.user.name ?? "member",
            }}
          />
        </h1>
        <Switch
          options={[
            intl.formatMessage({ defaultMessage: "Add" }),
            intl.formatMessage({ defaultMessage: "Set" }),
          ]}
          setSelected={setSelectedType}
          selected={type}
          className="mx-auto mb-4"
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            allocate({
              roundMemberId: member.id,
              amount,
              type: type.toUpperCase(),
            }).then(({ error }) => {
              if (error) {
                toast.error(error.message);
              } else {
                handleClose();
                toast.success(
                  intl.formatMessage({
                    defaultMessage: "Allocated funds successfully",
                  })
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
            className="w-36 mx-auto mb-2"
          />
          <p className="text-center mb-4 text-sm text-gray-800">
            {type === "Add" ? (
              <>
                <FormattedMessage defaultMessage="Adding " />{" "}
                <FormattedNumber
                  value={amount / 100}
                  style="currency"
                  currencyDisplay={"symbol"}
                  currency={round.currency}
                />{" "}
                <FormattedMessage defaultMessage=" to " />{" "}
                <FormattedNumber
                  value={total / 100}
                  style="currency"
                  currencyDisplay={"symbol"}
                  currency={round.currency}
                />{" "}
                <FormattedMessage defaultMessage=" in total" />
              </>
            ) : (
              <>
                <FormattedMessage defaultMessage="Set balance to" />{" "}
                <FormattedNumber
                  value={amount / 100}
                  style="currency"
                  currencyDisplay={"symbol"}
                  currency={round.currency}
                />
                <br />
                <FormattedMessage defaultMessage="previously" />{" "}
                <FormattedNumber
                  value={member.balance / 100}
                  style="currency"
                  currencyDisplay={"symbol"}
                  currency={round.currency}
                />
              </>
            )}
          </p>

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

export default AllocateModal;
