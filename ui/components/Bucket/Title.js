import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import { Tooltip } from "react-tippy";

import TextField from "components/TextField";
import Button from "components/Button";
import IconButton from "components/IconButton";
import { EditIcon } from "components/Icons";

const EDIT_TITLE_MUTATION = gql`
  mutation EditTitle($bucketId: ID!, $title: String) {
    editDream(bucketId: $bucketId, title: $title) {
      id
      title
    }
  }
`;

const DreamTitle = ({ title, canEdit, bucketId }) => {
  const [{ fetching: loading }, editDream] = useMutation(EDIT_TITLE_MUTATION);
  const { handleSubmit, register, errors } = useForm();

  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <>
        <form
          onSubmit={handleSubmit((variables) =>
            editDream({ bucketId, ...variables })
              .then(() => setEditing(false))
              .catch((err) => alert(err.message))
          )}
        >
          <TextField
            className="mb-2"
            placeholder="Title"
            name="title"
            defaultValue={title}
            size="large"
            inputRef={register({ required: "Required" })}
            inputProps={{
              maxLength: 100,
            }}
            autoFocus
            error={Boolean(errors.title)}
            helperText={errors.title?.message}
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

              <Button loading={loading} type="submit">
                Save
              </Button>
            </div>
          </div>
        </form>
      </>
    );
  }
  if (title) {
    return (
      <div className="flex items-start justify-between group relative">
        <h1 className="mb-2 text-4xl font-medium">{title}</h1>
        {canEdit && (
          <div className="absolute top-0 right-0">
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

export default DreamTitle;
