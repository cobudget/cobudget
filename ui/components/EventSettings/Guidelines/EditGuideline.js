import { useMutation, gql } from "@apollo/client";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers";

import { Modal } from "@material-ui/core";
import TextField from "components/TextField";
import Button from "components/Button";

const ADD_GUIDELINE_MUTATION = gql`
  mutation AddGuideline($eventId: ID!, $guideline: GuidelineInput!) {
    addGuideline(eventId: $eventId, guideline: $guideline) {
      id
      guidelines {
        id
        title
        description
        position
      }
    }
  }
`;

const EDIT_GUIDELINE_MUTATION = gql`
  mutation EditGuideline(
    $eventId: ID!
    $guidelineId: ID!
    $guideline: GuidelineInput!
  ) {
    editGuideline(
      eventId: $eventId
      guidelineId: $guidelineId
      guideline: $guideline
    ) {
      id
      guidelines {
        id
        title
        description
      }
    }
  }
`;

const schema = yup.object().shape({
  guideline: yup.object().shape({
    title: yup.string().required("Required"),
    description: yup.string().required("Required"),
  }),
});

export default ({
  event,
  handleClose,
  guideline = {
    title: "",
    description: "",
  },
}) => {
  const editing = Boolean(guideline.id);

  const [addOrEditGuideline, { loading }] = useMutation(
    editing ? EDIT_GUIDELINE_MUTATION : ADD_GUIDELINE_MUTATION,
    {
      variables: {
        eventId: event.id,
        ...(editing && { guidelineId: guideline.id }),
      },
    }
  );

  const { handleSubmit, register, errors } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-sm">
        <h1 className="text-lg font-semibold mb-2">
          {editing ? "Editing" : "Add"} guideline
        </h1>
        <form
          onSubmit={handleSubmit((variables) =>
            addOrEditGuideline({ variables })
              .then(() => handleClose())
              .catch((err) => alert(err.message))
          )}
        >
          <div className="grid gap-4">
            <TextField
              placeholder="Title"
              name="guideline.title"
              defaultValue={guideline.title}
              inputRef={register}
              error={errors.guideline?.title}
              helperText={errors.guideline?.title?.message}
              color={event.color}
            />
            <TextField
              placeholder="Description"
              name={"guideline.description"}
              defaultValue={guideline.description}
              multiline
              rows={4}
              inputRef={register}
              error={errors.guideline?.description}
              helperText={errors.guideline?.description?.message}
              color={event.color}
            />
          </div>

          <div className="mt-4 flex justify-end items-center">
            <div className="flex">
              <Button
                variant="secondary"
                onClick={handleClose}
                className="mr-2"
                color={event.color}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading} color={event.color}>
                Save
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
