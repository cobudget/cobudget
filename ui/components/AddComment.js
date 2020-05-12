import useForm from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { TextField, Button } from "@material-ui/core";

import Avatar from "./Avatar";

const ADD_COMMENT = gql`
  mutation addComment($content: String!, $dreamId: ID!) {
    addComment(content: $content, dreamId: $dreamId) {
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

const AddComment = ({ currentUser, dreamId }) => {
  const [addComment] = useMutation(ADD_COMMENT);
  const [content, setContent] = React.useState("");
  const { handleSubmit, register, errors } = useForm();
  const inputRef = React.useRef();

  return (
    <form
      onSubmit={handleSubmit((variables) => {
        addComment({ variables: { content, dreamId } })
          .then(() => {
            inputRef.current.blur();
            setContent("");
          })
          .catch((err) => alert(err.message));
      })}
    >
      <div className="flex mt-6">
        <div className="mr-4">
          <Avatar user={currentUser} />
        </div>
        <div className="flex-grow">
          <div className="mb-2">
            <TextField
              name="content"
              label="Add comment"
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
          </div>
          <div
            className={`flex justify-end ${
              content.length ? "visible" : "invisible"
            }`}
          >
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={content.length === 0}
              color="primary"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddComment;
