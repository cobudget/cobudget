import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import Tooltip from "@tippyjs/react";
import { FormattedMessage, useIntl } from "react-intl";

import TextField from "components/TextField";
import Button from "components/Button";
import IconButton from "components/IconButton";
import { EditIcon } from "components/Icons";

const EDIT_SUMMARY_MUTATION = gql`
  mutation EditSummary($bucketId: ID!, $summary: String) {
    editBucket(bucketId: $bucketId, summary: $summary) {
      id
      summary
    }
  }
`;

const BucketSummary = ({ summary, canEdit, bucketId }) => {
  const intl = useIntl();
  const [{ fetching: loading }, editBucket] = useMutation(
    EDIT_SUMMARY_MUTATION
  );

  const { handleSubmit, register } = useForm();

  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(summary ?? "");
  if (editing)
    return (
      <>
        <form
          onSubmit={handleSubmit((variables) =>
            editBucket({ bucketId, ...variables })
              .then(() => setEditing(false))
              .catch((err) => alert(err.message))
          )}
        >
          <TextField
            className="mb-2"
            multiline
            name="summary"
            placeholder={intl.formatMessage({ defaultMessage: "Summary" })}
            inputRef={register}
            inputProps={{
              maxLength: 160,
              value: inputValue,
              onChange: (e) => setInputValue(e.target.value),
            }}
            autoFocus
          />
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600 font-medium pl-4">
              {160 - inputValue.length}{" "}
              <FormattedMessage defaultMessage="characters remaining" />
            </div>
            <div className="flex">
              <Button
                className="mr-2"
                variant="secondary"
                onClick={() => setEditing(false)}
              >
                <FormattedMessage defaultMessage="Cancel" />
              </Button>

              <Button loading={loading} type="submit">
                <FormattedMessage defaultMessage="Save" />
              </Button>
            </div>
          </div>
        </form>
      </>
    );

  if (summary)
    return (
      <div className="whitespace-pre-line pb-4 text-lg text-gray-900 relative group text-center mb-2">
        {summary}
        {canEdit && (
          <div className="absolute top-0 right-0">
            <Tooltip
              content={intl.formatMessage({ defaultMessage: "Edit summary" })}
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
        className="block w-full h-20 text-gray-600 font-semibold rounded-lg border-3 border-dashed hover:bg-gray-100 mb-4 focus:outline-none focus:bg-gray-100"
      >
        <FormattedMessage defaultMessage="+ Summary" />
      </button>
    );

  return null;
};

export default BucketSummary;
