import React from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
// import { TextField, Button } from "@material-ui/core";
import TextField from "components/TextField";
import Button from "components/Button";
import Box from "@material-ui/core/Box";
import { useForm } from "react-hook-form";

const EDIT_COMMENT_MUTATION = gql`
  mutation EditComment($dreamId: ID!, $commentId: ID!, $content: String!) {
    editComment(dreamId: $dreamId, commentId: $commentId, content: $content) {
      id
      numberOfComments
      comments {
        id
        content
        createdAt
        updatedAt
        author {
          id
          name
          avatar
        }
      }
    }
  }
`;

const EditComment = ({ comment, dreamId, handleDone, event }) => {
  const { handleSubmit, register, errors } = useForm();

  const [editComment, { loading }] = useMutation(EDIT_COMMENT_MUTATION, {
    variables: { dreamId, commentId: comment.id },
  });
  return (
    <form
      onSubmit={handleSubmit((variables) => {
        editComment({ variables })
          .then(() => {
            handleDone();
          })
          .catch((err) => alert(err.message));
      })}
    >
      <TextField
        name="content"
        className="mb-2"
        placeholder="Comment"
        multiline
        error={Boolean(errors.content)}
        helperText={errors.content?.message}
        defaultValue={comment.content}
        inputRef={register({ required: "Required" })}
        autoFocus
        color={event.color}
      />
      <div className="flex justify-end">
        <Button
          onClick={handleDone}
          className="mr-2"
          variant="secondary"
          color={event.color}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading} color={event.color}>
          Save
        </Button>
      </div>
    </form>
  );
};

export default EditComment;
