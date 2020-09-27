import { useForm } from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import Button from "components/Button";
import { SelectField } from "components/SelectInput";

const EDIT_EVENT = gql`
  mutation editEvent($eventId: ID!, $dreamReviewIsOpen: Boolean) {
    editEvent(eventId: $eventId, dreamReviewIsOpen: $dreamReviewIsOpen) {
      id
      dreamReviewIsOpen
    }
  }
`;

export default ({ event, handleClose }) => {
  const [editEvent, { loading }] = useMutation(EDIT_EVENT, {
    variables: { eventId: event.id },
  });
  const {
    handleSubmit,
    register,
    setValue,
    formState: { isDirty },
    errors,
  } = useForm();

  return (
    <div className="px-6">
      <h2 className="text-2xl font-semibold mb-2">Dream Review</h2>
      <p className="text-gray-700 mb-4">
        If you have set up guidelines you can allow users to review each others
        dreams according to them.
      </p>
      <form
        onSubmit={handleSubmit((variables) => {
          editEvent({
            variables: {
              ...variables,
              dreamReviewIsOpen: variables.dreamReviewIsOpen === "true",
            },
          })
            .then(() => handleClose())
            .catch((error) => alert(error.message));
        })}
      >
        <SelectField
          name="dreamReviewIsOpen"
          label="Show Review Monster"
          defaultValue={event.dreamReviewIsOpen ? "true" : "false"}
          inputRef={register}
          className="my-4"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </SelectField>

        <div className="mt-2 flex justify-end">
          <Button
            color={event.color}
            onClick={handleClose}
            variant="secondary"
            className="mr-2"
          >
            Close
          </Button>
          <Button
            color={event.color}
            type="submit"
            disabled={!isDirty}
            loading={loading}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};
