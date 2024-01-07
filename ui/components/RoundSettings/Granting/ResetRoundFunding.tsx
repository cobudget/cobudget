import { useMutation, gql } from "urql";
import Router from "next/router";
import { useState } from "react";
import { Modal } from "@material-ui/core";
import toast from "react-hot-toast";
import TextField from "../../TextField";
import Button from "../../Button";
import Banner from "../../Banner";
import { FormattedMessage, useIntl } from "react-intl";

const RESET_ROUND_FUNDING_MUTATION = gql`
  mutation ResetRoundFunding($roundId: ID!) {
    resetRoundFunding(roundId: $roundId) {
      id
    }
  }
`;

export default ({ round, handleClose }) => {
  const [allowDelete, setAllowDelete] = useState(false);
  const intl = useIntl();
  const [{ fetching: loading }, resetRoundFunding] = useMutation(
    RESET_ROUND_FUNDING_MUTATION
  );

  const checkIfTextMatched = (e) => {
    const text = e.target.value;
    setAllowDelete(text === round.slug);
  };

  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-sm">
        <h1 className="text-2xl font-semibold mb-4">
          <FormattedMessage defaultMessage="Are you absolutely sure?" />
        </h1>
        <Banner
          className={"mb-4"}
          variant="critical"
          title={intl.formatMessage(
            {
              defaultMessage:
                "You are about to reset the funding in {roundName}. Please read this carefully to understand what this means.",
            },
            {
              roundName: round?.title,
            }
          )}
        ></Banner>
        <p className="mb-4">
          <FormattedMessage defaultMessage="This action cannot be undone. This will completely reset the funding of all buckets and participants in this rounds. All funds will be removed from buckets, including fully funded ones. All participant balances will be set to zero. Are you sure this is what you want?" />
        </p>{" "}
        <p className="mb-4">
          <FormattedMessage
            defaultMessage="Please type <b>{slug}</b> to confirm."
            values={{
              slug: round.slug,
              b: (msg) => <b>{msg}</b>,
            }}
          />
        </p>
        <div className="grid gap-4">
          <TextField
            inputProps={{ onChange: checkIfTextMatched }}
            name={"customField.name"}
            color="red"
          />
        </div>
        <div className="mt-4">
          <div className="">
            <Button
              onClick={() => {
                resetRoundFunding({ roundId: round?.id }).then(() => {
                  handleClose();
                  toast.success(
                    intl.formatMessage({
                      defaultMessage: "Funding has been reset",
                    })
                  );
                });
              }}
              loading={loading}
              disabled={!allowDelete}
              color="red"
              className="w-full"
            >
              <FormattedMessage defaultMessage="I understand the consequences, reset funding for this round" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
