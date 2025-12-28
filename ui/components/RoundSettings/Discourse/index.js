import { useForm } from "react-hook-form";
import { useMutation, useQuery, gql } from "urql";
import Button from "components/Button";
import { SelectField } from "components/SelectInput";
import HappySpinner from "../../HappySpinner";
import { FormattedMessage } from "react-intl";

const EDIT_ROUND = gql`
  mutation editRound($roundId: ID!, $discourseCategoryId: Int) {
    editRound(roundId: $roundId, discourseCategoryId: $discourseCategoryId) {
      id
      discourseCategoryId
    }
  }
`;

export const CATEGORIES_QUERY = gql`
  query Categories($groupId: ID!) {
    categories(groupId: $groupId) {
      id
      name
    }
  }
`;

const Discourse = ({ round, currentGroup }) => {
  const [{ fetching: loading }, editRound] = useMutation(EDIT_ROUND);

  const [{ data: { categories } = { categories: [] } }] = useQuery({
    query: CATEGORIES_QUERY,
    variables: { groupId: currentGroup.id },
  });

  const {
    handleSubmit,
    register,
    formState: { isDirty },
  } = useForm();
  const discourseCategoryIdField = register("discourseCategoryId");

  if (!currentGroup) return null;

  return (
    <div className="px-6">
      <h2 className="text-2xl font-semibold mb-2">
        <FormattedMessage defaultMessage="Category" />
      </h2>
      <p className="text-gray-700 mb-4">
        <FormattedMessage
          defaultMessage="Select the discourse category that {bucketName} in this round will be posted to"
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
            discourseCategoryId: parseInt(variables.discourseCategoryId),
          })
            //.then(() => handleClose())
            .catch((error) => alert(error.message));
        })}
      >
        {categories.length > 0 ? (
          <SelectField
            name={discourseCategoryIdField.name}
            defaultValue={round.discourseCategoryId}
            inputRef={discourseCategoryIdField.ref}
            inputProps={{ onChange: discourseCategoryIdField.onChange }}
            className="my-4"
          >
            {categories.map((c) => (
              <option key={c.id} value={parseInt(c.id)}>
                {c.name}
              </option>
            ))}
          </SelectField>
        ) : (
          <HappySpinner />
        )}

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

export default Discourse;
