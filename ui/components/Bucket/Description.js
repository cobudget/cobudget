import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import Tooltip from "@tippyjs/react";
import { FormattedMessage } from "react-intl";

import TextField from "components/TextField";
import Button from "components/Button";
import IconButton from "components/IconButton";
import { EditIcon } from "components/Icons";
import Markdown from "components/Markdown";

const EDIT_DESCRIPTION_MUTATION = gql`
  mutation EditDescription($bucketId: ID!, $description: String) {
    editBucket(bucketId: $bucketId, description: $description) {
      id
      description
    }
  }
`;

const BucketDescription = ({ description, bucketId, canEdit }) => {
  const [{ fetching: loading }, editBucket] = useMutation(
    EDIT_DESCRIPTION_MUTATION
  );

  const { handleSubmit, register } = useForm();

  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(description ?? "");

  const descriptionRegister = register("description");

  if (editing)
    return (
      <form
        onSubmit={handleSubmit((variables) =>
          editBucket({ bucketId, ...variables })
            .then(() => setEditing(false))
            .catch((err) => alert(err.message))
        )}
      >
        <TextField
          name="description"
          placeholder="Description"
          inputRef={descriptionRegister.ref}
          multiline
          rows={10}
          defaultValue={description}
          autoFocus
          inputProps={{
            ...descriptionRegister,
            onChange: (e) => {
              descriptionRegister.onChange(e);
              setInputValue(e.target.value);
            },
          }}
          className="mb-2"
        />
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600 font-medium pl-4">
            <a
              href="https://www.markdownguide.org/cheat-sheet/"
              target="_/blank"
              className="hover:text-gray-800 border-b hover:border-gray-800"
            >
              <FormattedMessage defaultMessage="Markdown" />
            </a>{" "}
            <FormattedMessage defaultMessage="allowed." />
          </div>
          <div className="flex">
            <Button
              onClick={() => setEditing(false)}
              variant="secondary"
              className="mr-2"
            >
              <FormattedMessage defaultMessage="Cancel" />
            </Button>
            <Button type="submit" loading={loading}>
              <FormattedMessage defaultMessage="Save" />
            </Button>
          </div>
        </div>
      </form>
    );

  if (description)
    return (
      <div className="relative pb-4">
        <Markdown source={description} />
        {canEdit && (
          <div className="absolute top-0 right-0">
            <Tooltip
              content="Edit description"
              placement="bottom"
              arrow={false}
            >
              <IconButton onClick={() => setEditing(true)}>
                <EditIcon className="h-6 w-6" />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>
    );

  if (canEdit)
    return (
      <button
        onClick={() => setEditing(true)}
        className="block w-full h-64 text-gray-600 font-semibold rounded-lg border-3 border-dashed focus:outline-none focus:bg-gray-100 hover:bg-gray-100 mb-4"
      >
        <FormattedMessage defaultMessage="+ Description" />
      </button>
    );
  return null;
};

export default BucketDescription;
