import { useForm } from "react-hook-form";

import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import Router from "next/router";

import { Modal } from "@material-ui/core";

import TextField from "components/TextField";
import Button from "components/Button";

const CREATE_DREAM = gql`
  mutation CreateDream($eventId: ID!, $title: String!) {
    createDream(eventId: $eventId, title: $title) {
      id
      slug
      title
    }
  }
`;

export default ({ event, open, handleClose }) => {
  const [createDream, { loading }] = useMutation(CREATE_DREAM, {
    variables: { eventId: event.id },
  });

  const { handleSubmit, register, errors } = useForm();

  const onSubmitCreate = (variables) => {
    createDream({
      variables,
    })
      .then(({ data }) => {
        Router.push(
          "/[event]/[dream]",
          `/${event.slug}/${data.createDream.slug}`
        );
        handleClose();
      })
      .catch((err) => {
        console.log({ err });
        alert(err.message);
      });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-sm">
        <form onSubmit={handleSubmit(onSubmitCreate)}>
          <h1 className="text-xl font-semibold">New dream</h1>

          <TextField
            className="my-3"
            name="title"
            size="large"
            placeholder="Title"
            inputRef={register({
              required: "Required",
            })}
            error={Boolean(errors.title)}
            helperText={errors.title?.message}
          />

          <div className="flex justify-end">
            <Button size="large" type="submit" loading={loading}>
              Create
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
