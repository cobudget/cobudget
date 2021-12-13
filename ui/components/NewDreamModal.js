import { useForm } from "react-hook-form";

import { useMutation, gql } from "urql";
import Router from "next/router";

import { Modal } from "@material-ui/core";

import TextField from "components/TextField";
import Button from "components/Button";

const CREATE_DREAM = gql`
  mutation CreateDream($collectionId: ID!, $title: String!) {
    createDream(collectionId: $collectionId, title: $title) {
      id
      description
      summary
      title
      minGoal
      maxGoal
      income
      totalContributions
      numberOfComments
      published
      approved
      canceled
      customFields {
        value
        customField {
          id
          name
          type
          limit
          description
          isRequired
          position
          createdAt
        }
      }
      images {
        id
        small
        large
      }
    }
  }
`;

const NewDreamModal = ({ collection, handleClose, currentOrg }) => {
  const [{ fetching: loading }, createDream] = useMutation(
    CREATE_DREAM
    // refetchQueries: ["Dreams"],
  );

  const { handleSubmit, register, errors } = useForm();

  const onSubmitCreate = (variables) => {
    createDream({ ...variables, collectionId: collection.id })
      .then(({ data }) => {
        Router.push(
          "/[org]/[collection]/[bucket]",
          `/${currentOrg?.slug ?? "c"}/${collection.slug}/${
            data.createDream.id
          }`
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
            color={collection.color}
          />

          <div className="flex justify-end">
            <Button
              size="large"
              variant="secondary"
              onClick={handleClose}
              className="mr-3"
              color={collection.color}
            >
              Cancel
            </Button>
            <Button
              size="large"
              type="submit"
              loading={loading}
              color={collection.color}
            >
              Create
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default NewDreamModal;
