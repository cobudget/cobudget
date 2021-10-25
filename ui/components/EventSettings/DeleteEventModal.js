import { useMutation, gql } from "urql";
import Router from "next/router";
import { useState } from "react";
import { Modal } from "@material-ui/core";
import TextField from "../TextField";
import Button from "../Button";
import Banner from "../Banner";

const DELETE_EVENT_MUTATION = gql`
  mutation DeleteEvent($eventId: ID!) {
    deleteEvent(eventId: $eventId) {
      id
    }
  }
`;

export default ({ event, handleClose, currentOrg }) => {
  const [allowDelete, setAllowDelete] = useState(false);
  const [{ fetching: loading }, deleteEvent] = useMutation(
    DELETE_EVENT_MUTATION
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    deleteEvent({ eventId: event.id })
      .then(() => {
        handleClose();
        Router.push("/");
      })
      .catch((err) => {
        console.log(err);
        alert(err.message);
      });
  };

  const checkIfTextMatched = (e) => {
    const text = e.target.value;
    setAllowDelete(text === event.slug);
  };

  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-sm">
        <h1 className="text-2xl font-semibold mb-4">
          Are you absolutely sure?
        </h1>
        <Banner
          className={"mb-4"}
          variant="critical"
          title={"Unexpected bad things will happen if you don’t read this!"}
        ></Banner>
        <p className="mb-4">
          This action cannot be undone. This will permanently delete the{" "}
          <b>{event.title}</b> collection, buckets, questions, comments and
          remove all collaborators.{" "}
        </p>
        <p className="mb-4">
          Please type <b>{event.slug}</b> to confirm.
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
                I understand the consequences, delete this event
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
