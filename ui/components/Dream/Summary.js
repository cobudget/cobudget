import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import { Tooltip } from "react-tippy";

import TextField from "components/TextField";
import Button from "components/Button";
import IconButton from "components/IconButton";
import { EditIcon } from "components/Icons";

const EDIT_SUMMARY_MUTATION = gql`
  mutation EditSummary($bucketId: ID!, $summary: String) {
    editDream(bucketId: $bucketId, summary: $summary) {
      id
      summary
    }
  }
`;

const DreamSummary = ({ summary, canEdit, bucketId }) => {
  const [{ fetching: loading }, editDream] = useMutation(EDIT_SUMMARY_MUTATION);

  const { handleSubmit, register } = useForm();

  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(summary ?? "");

  if (editing)
    return (
      <>
        <form
          onSubmit={handleSubmit(() =>
            editDream({ bucketId, summary: inputValue })
              .then(() => setEditing(false))
              .catch((err) => alert(err.message))
          )}
        >
          <TextField
            className="mb-2"
            multiline
            placeholder="Summary"
            defaultValue={inputValue}
            inputRef={register}
            inputProps={{
              maxLength: 160,
              onChange: (e) => setInputValue(e.target.value),
            }}
            autoFocus
            wysiwyg
          />
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600 font-medium pl-4">
              {160 - inputValue.length} characters remaining
            </div>
            <div className="flex">
              <Button
                className="mr-2"
                variant="secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>

              <Button loading={loading} type="submit">
                Save
              </Button>
            </div>
          </div>
        </form>
      </>
    );

  if (summary)
    return (
      <div className="whitespace-pre-line pb-4 text-lg text-gray-900 relative group">
        {summary}
        {canEdit && (
          <div className="absolute top-0 right-0">
            <Tooltip title="Edit summary" position="bottom" size="small">
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
        className="block w-full h-20 text-gray-600 font-semibold rounded-lg border-3 border-dashed hover:bg-gray-100 mb-4 focus:outline-none focus:bg-gray-100"
      >
        + Summary
      </button>
    );

  return null;
};

export default DreamSummary;
