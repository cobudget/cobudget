import Link from "next/link";
import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import TextField from "components/TextField";
import Button from "components/Button";
import { FormattedMessage, useIntl, } from "react-intl";

const CREATE_TAG = gql`
  mutation createTag($roundId: ID!, $tagValue: String!) {
    createTag(roundId: $roundId, tagValue: $tagValue) {
      id
      tags {
        id
        value
      }
    }
  }
`;

const DELETE_TAG = gql`
  mutation deleteTag($roundId: ID!, $tagId: ID!) {
    deleteTag(roundId: $roundId, tagId: $tagId) {
      id
      tags {
        id
        value
      }
    }
  }
`;

const Tags = ({ round, currentGroup }) => {
  const {
    handleSubmit,
    reset,
    register,
    formState: { isDirty },
  } = useForm();
  const [{ fetching }, createTag] = useMutation(CREATE_TAG);
  const [{ fetching: fetchingDelete }, deleteTag] = useMutation(DELETE_TAG);
  const intl = useIntl();

  return (
    <div className="mx-6">
      <h1 className="text-2xl font-semibold mb-6">
        <FormattedMessage defaultMessage="Tags" />
      </h1>

      <div className="flex items-center flex-wrap gap-3 mb-4">
        {round.tags.map((tag) => (
          <div
            key={tag.id}
            className="py-1 px-2 bg-gray-100 rounded flex items-center"
          >
            <Link
              href={`/${currentGroup?.slug ?? "c"}/${round.slug}?tag=${
                tag.value
              }`}
            >
              <a className="text-gray-500 hover:text-black">{tag.value}</a>
            </Link>
            <button
              disabled={fetchingDelete}
              onClick={() =>
                confirm(
                  intl.formatMessage({ defaultMessage:"Are you sure you want to permanently delete this tag?" })
                ) && deleteTag({ roundId: round.id, tagId: tag.id })
              }
              className="ml-2 px-2 rounded-md bg-gray-400 hover:bg-gray-700 hover:text-gray-100"
            >
              <FormattedMessage defaultMessage="Delete" />
            </button>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit((variables) => {
          createTag({
            ...variables,
            roundId: round.id,
          })
            .then(() => reset())
            .catch((error) => alert(error.message));
        })}
      >
        <TextField
          name="tagValue"
          label={intl.formatMessage({ defaultMessage: "Create a new tag"})}
          placeholder={intl.formatMessage({ defaultMessage:"New tag name"})}
          inputRef={register}
          className="my-4"
        />

        <div className="mt-2 flex justify-end">
          <Button
            color={round.color}
            type="submit"
            disabled={!isDirty}
            loading={fetching}
          >
            <FormattedMessage defaultMessage="Create" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Tags;
