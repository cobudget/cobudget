import React from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { TextField, Button } from "@material-ui/core";
import Box from '@material-ui/core/Box';
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
        author {
          id
          name
          avatar
        }
      }
    }
  }
`;

const EditComment = ({ comment, dreamId, handleDone }) => {
  const { handleSubmit, register, errors } = useForm();
  const inputRef = React.useRef();
  const [content, setContent] = React.useState(comment.content);

  const [editComment] = useMutation(EDIT_COMMENT_MUTATION);
  return (
    <form
      onSubmit={handleSubmit((variables) => {
        editComment({ variables: { dreamId, commentId: comment.id, content} })
          .then(() => {
            handleDone();
          })
          .catch((err) => alert(err.message));
      })}
    >
      <Box my={2}>
        <TextField
          name="content"
          label="Edit comment"
          variant="outlined"
          multiline
          error={Boolean(errors.content)}
          helperText={errors.content && errors.content.message}
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
          inputRef={(e) => {
            register({ required: "Required" });
            inputRef.current = e;
          }}
        />
      </Box>
      <Button
        type="submit"
        size="large"
        variant="contained"
        color="primary"
      >
        Save
      </Button>
    </form>
  );
};

export default EditComment;
