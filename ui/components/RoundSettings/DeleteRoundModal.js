import { useMutation, gql } from "urql";
import Router from "next/router";
import { useState } from "react";
import { Modal } from "@material-ui/core";
import toast from "react-hot-toast";
import TextField from "../TextField";
import Button from "../Button";
import Banner from "../Banner";
import { FormattedMessage, useIntl } from "react-intl";

const DELETE_ROUND_MUTATION = gql`
  mutation DeleteRound($roundId: ID!) {
    deleteRound(roundId: $roundId) {
      id
    }
  }
`;

export default ({ round, handleClose, currentGroup }) => {
  const [allowDelete, setAllowDelete] = useState(false);
  const intl = useIntl();
  const [{ fetching: loading }, deleteRound] = useMutation(
    DELETE_ROUND_MUTATION
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    deleteRound({ roundId: round.id }).then(({ error }) => {
      if (error) {
        toast.error(error.message);
      } else {
        handleClose();
        Router.push(`/${currentGroup?.slug ?? "c"}/`);
        toast.success(intl.formatMessage({ defaultMessage: "Round deleted" }));
      }
    });
  };

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
          title={intl.formatMessage({
            defaultMessage:
              "Unexpected bad things will happen if you don’t read this!",
          })}
        ></Banner>
        <p className="mb-4">
          <FormattedMessage
            defaultMessage="This action cannot be undone. This will permanently delete the <b>{roundTitle}</b> round, {bucketName} questions, comments and remove all collaborators."
            values={{
              roundTitle: round.title,
              bucketName: process.env.BUCKET_NAME_PLURAL,
              b: (msg) => <b>{msg}</b>,
            }}
          />
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
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <TextField
              inputProps={{ onChange: checkIfTextMatched }}
              name={"customField.name"}
              color="red"
            />
          </div>

          <div className="mt-4 flex justify-end items-center">
            <div className="flex">
              <Button
                type="submit"
                loading={loading}
                disabled={!allowDelete}
                color="red"
              >
                <FormattedMessage defaultMessage="I understand the consequences, delete this round" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
