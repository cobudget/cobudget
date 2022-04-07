import { useForm } from "react-hook-form";

import { useMutation, gql } from "urql";
import Router from "next/router";

import { Modal } from "@material-ui/core";

import TextField from "components/TextField";
import Button from "components/Button";

const CREATE_BUCKET = gql`
  mutation CreateBucket($roundId: ID!, $title: String!) {
    createBucket(roundId: $roundId, title: $title) {
      id
      title
    }
  }
`;

const NewBucketModal = ({ round, handleClose, currentGroup }) => {
  const [{ fetching: loading }, createBucket] = useMutation(CREATE_BUCKET);

  const { handleSubmit, register, errors } = useForm();

  const onSubmitCreate = (variables) => {
    createBucket({ ...variables, roundId: round.id })
      .then(({ data }) => {
        Router.push(
          "/[Group]/[round]/[bucket]",
          `/${currentGroup?.slug ?? "c"}/${round.slug}/${data.createBucket.id}`
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
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-sm">
        <form onSubmit={handleSubmit(onSubmitCreate)}>
          <h1 className="text-xl font-semibold">New bucket</h1>

          <TextField
            className="my-3"
            name="title"
            size="large"
            placeholder="Title"
            inputRef={register({
              required: "Required",
            })}
            autoFocus
            error={Boolean(errors.title)}
            helperText={errors.title?.message}
            color={round.color}
          />

          <div className="flex justify-end">
            <Button
              size="large"
              variant="secondary"
              onClick={handleClose}
              className="mr-3"
              color={round.color}
            >
              Cancel
            </Button>
            <Button
              size="large"
              type="submit"
              loading={loading}
              color={round.color}
            >
              Create
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default NewBucketModal;
