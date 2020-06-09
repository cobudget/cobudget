import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Tooltip } from "react-tippy";

import TextField from "components/TextField";
import Button from "components/Button";
import IconButton from "components/IconButton";
import { EditIcon } from "components/Icons";

const EDIT_TITLE_MUTATION = gql`
  mutation EditTitle($dreamId: ID!, $title: String) {
    editDream(dreamId: $dreamId, title: $title) {
      id
      title
    }
  }
`;

export default ({ title, canEdit, dreamId }) => {
  const [editDream, { loading }] = useMutation(EDIT_TITLE_MUTATION, {
    variables: { dreamId },
  });
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(title ?? "");
  if (editing) {
    return (
      <>
        <TextField
          className="mb-2"
          placeholder="Title"
          size="large"
          inputProps={{
            maxLength: 100,
            value: inputValue,
            onChange: (e) => setInputValue(e.target.value),
          }}
          autoFocus
        />
        <div className="flex justify-end  mb-4">
          <div className="flex">
            <Button
              className="mr-2"
              variant="secondary"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>

            <Button
              loading={loading}
              onClick={() =>
                editDream({ variables: { title: inputValue } })
                  .then(() => setEditing(false))
                  .catch((err) => alert(err.message))
              }
            >
              Save
            </Button>
          </div>
        </div>
      </>
    );
  }
  if (title) {
    return (
      <div className="flex items-start justify-between group relative">
        <h1 className="mb-2 text-4xl font-medium">{title}</h1>
        {canEdit && (
          <div className="absolute top-0 right-0 invisible group-hover:visible">
            <Tooltip title="Edit title" position="bottom" size="small">
              <IconButton onClick={() => setEditing(true)}>
                <EditIcon className="h-6 w-6" />
              </IconButton>
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
};
