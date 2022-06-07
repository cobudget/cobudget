import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import Button from "components/Button";
import { SelectField } from "components/SelectInput";
import capitalize from "utils/capitalize";
import { FormattedMessage, useIntl } from "react-intl";

const EDIT_ROUND = gql`
  mutation editRound($roundId: ID!, $bucketReviewIsOpen: Boolean) {
    editRound(roundId: $roundId, bucketReviewIsOpen: $bucketReviewIsOpen) {
      id
      bucketReviewIsOpen
    }
  }
`;

const BucketReview = ({ round }) => {
  const intl = useIntl();
  const [{ fetching: loading }, editRound] = useMutation(EDIT_ROUND);
  const {
    handleSubmit,
    register,
    formState: { isDirty },
  } = useForm();

  return (
    <div className="px-6">
      <h2 className="text-2xl font-semibold mb-2">
        <FormattedMessage
          defaultMessage="{bucketName} Review"
          values={{
            bucketName: capitalize(process.env.BUCKET_NAME_SINGULAR),
          }}
        />
      </h2>
      <p className="text-gray-700 mb-4">
        <FormattedMessage
          defaultMessage="If you have set up guidelines you can allow users to review each others {bucketName} according to them."
          values={{
            bucketName: process.env.BUCKET_NAME_PLURAL,
          }}
        />
      </p>
      <form
        onSubmit={handleSubmit((variables) => {
          editRound({
            ...variables,
            roundId: round.id,
            bucketReviewIsOpen: variables.bucketReviewIsOpen === "true",
          })
            //.then(() => null)
            .catch((error) => alert(error.message));
        })}
      >
        <SelectField
          name="bucketReviewIsOpen"
          label={intl.formatMessage({ defaultMessage: "Show Review Prompt" })}
          defaultValue={round.bucketReviewIsOpen ? "true" : "false"}
          inputRef={register}
          className="my-4"
        >
          <option value="true">
            {intl.formatMessage({ defaultMessage: "true" })}
          </option>
          <option value="false">
            {intl.formatMessage({ defaultMessage: "false" })}
          </option>
        </SelectField>

        {/* <SelectField
          name="bucketReviewIsOpen"
          label="Who see's review monster"
          defaultValue={round.bucketReviewIsOpen ? "true" : "false"}
          inputRef={register}
          className="my-4"
        >
          <option value="true">All participants</option>
          <option value="false">Bucket creators, guides & admins</option>
        </SelectField>

        <SelectField
          name="bucketReviewIsOpen"
          label="Who can resolve a flag"
          defaultValue={round.bucketReviewIsOpen ? "true" : "false"}
          inputRef={register}
          className="my-4"
        >
          <option value="true">All participants</option>
          <option value="false">Bucket creators, guides & admins</option>
        </SelectField> */}

        <div className="mt-2 flex justify-end">
          <Button
            color={round.color}
            type="submit"
            disabled={!isDirty}
            loading={loading}
          >
            <FormattedMessage defaultMessage="Save" />
          </Button>
        </div>
      </form>
    </div>
  );
};
export default BucketReview;
