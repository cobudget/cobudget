import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import Button from "components/Button";
import { SelectField } from "components/SelectInput";

const EDIT_EVENT = gql`
  mutation editCollection($collectionId: ID!, $bucketReviewIsOpen: Boolean) {
    editCollection(
      collectionId: $collectionId
      bucketReviewIsOpen: $bucketReviewIsOpen
    ) {
      id
      bucketReviewIsOpen
    }
  }
`;

const BucketReview = ({ collection }) => {
  const [{ fetching: loading }, editCollection] = useMutation(EDIT_EVENT);
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
          editCollection({
            ...variables,
            collectionId: collection.id,
            bucketReviewIsOpen: variables.bucketReviewIsOpen === "true",
          })
            //.then(() => null)
            .catch((error) => alert(error.message));
        })}
      >
        <SelectField
          name="bucketReviewIsOpen"
          label="Show Review Prompt"
          defaultValue={collection.bucketReviewIsOpen ? "true" : "false"}
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
          <option value="false">Bucket creators, guides & admins</option>
        </SelectField>

        <SelectField
          name="bucketReviewIsOpen"
          label="Who can resolve a flag"
          defaultValue={event.bucketReviewIsOpen ? "true" : "false"}
          inputRef={register}
          className="my-4"
        >
          <option value="true">All participants</option>
          <option value="false">Bucket creators, guides & admins</option>
        </SelectField> */}

        <div className="mt-2 flex justify-end">
          <Button
            color={collection.color}
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
export default BucketReview;
