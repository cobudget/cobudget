import useForm from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

import {
  TextField,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Button
} from "@material-ui/core";
import Avatar from "./Avatar";

const ADD_COMMENT = gql`
  mutation addComment($content: String!, $dreamId: ID!) {
    addComment(content: $content, dreamId: $dreamId) {
      id
      comments {
        content
        createdAt
        author {
          name
          avatar
        }
      }
    }
  }
`;

const AddComment = ({ currentMember, dream }) => {
  const [addComment] = useMutation(ADD_COMMENT);
  const [content, setContent] = React.useState("");
  const { handleSubmit, register, errors, reset } = useForm();
  const inputRef = React.useRef();

  return (
    <form
      onSubmit={handleSubmit(variables => {
        addComment({ variables: { content, dreamId: dream.id } })
          .then(() => {
            inputRef.current.blur();
            setContent("");
          })
          .catch(err => alert(err.message));
      })}
    >
      <ListItem>
        <ListItemAvatar>
          <Avatar user={currentMember} />
        </ListItemAvatar>
        <ListItemText>
          <TextField
            name="content"
            label="Add comment"
            variant="outlined"
            error={Boolean(errors.content)}
            helperText={errors.content && errors.content.message}
            fullWidth
            value={content}
            onChange={e => setContent(e.target.value)}
            inputRef={e => {
              register(e);
              inputRef.current = e;
            }}
          />
        </ListItemText>
        <ListItemSecondaryAction>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </ListItemSecondaryAction>
      </ListItem>
    </form>
  );
};

export default AddComment;
