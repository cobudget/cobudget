import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import Button from "components/Button";
import { SelectField } from "components/SelectInput";

const EDIT_EVENT = gql`
  mutation editEvent($orgId: ID!, $eventId: ID!, $bucketReviewIsOpen: Boolean) {
    editEvent(
      orgId: $orgId
      eventId: $eventId
      bucketReviewIsOpen: $bucketReviewIsOpen
    ) {
      id
      bucketReviewIsOpen
    }
  }
`;

const DreamReview = ({ event, currentOrg }) => {
  const [{ fetching: loading }, editEvent] = useMutation(EDIT_EVENT);
  const {
    handleSubmit,
    register,
    formState: { isDirty },
  } = useForm();

  return (
    <div className="px-6">
      <h2 className="text-2xl font-semibold mb-2">Bucket Review</h2>
      <p className="text-gray-700 mb-4">
        If you have set up guidelines you can allow users to review each others{" "}
        buckets according to them.
      </p>
      <form
        onSubmit={handleSubmit((variables) => {
          editEvent({
            ...variables,
            orgId: currentOrg.id,
            eventId: event.id,
            bucketReviewIsOpen: variables.bucketReviewIsOpen === "true",
          })
            //.then(() => null)
            .catch((error) => alert(error.message));
        })}
      >
        <SelectField
          name="bucketReviewIsOpen"
          label="Show Review Prompt"
          defaultValue={event.bucketReviewIsOpen ? "true" : "false"}
          inputRef={register}
          className="my-4"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </SelectField>

        {/* <SelectField
          name="bucketReviewIsOpen"
          label="Who see's review monster"
          defaultValue={event.bucketReviewIsOpen ? "true" : "false"}
          inputRef={register}
          className="my-4"
        >
          <option value="true">All participants</option>
          <option value="false">Dream creators, guides & admins</option>
        </SelectField>

        <SelectField
          name="bucketReviewIsOpen"
          label="Who can resolve a flag"
          defaultValue={event.bucketReviewIsOpen ? "true" : "false"}
          inputRef={register}
          className="my-4"
        >
          <option value="true">All participants</option>
          <option value="false">Dream creators, guides & admins</option>
        </SelectField> */}

        <div className="mt-2 flex justify-end">
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
export default DreamReview;
