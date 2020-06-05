import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Card from "../styled/Card";
import { Box, Button, TextField } from "@material-ui/core";

const EDIT_EVENT = gql`
  mutation editEvent($eventId: ID!, $guidelines: String) {
    editEvent(eventId: $eventId, guidelines: $guidelines) {
      id
      guidelines
    }
  }
`;

export default ({ closeModal, event }) => {
  const [editEvent] = useMutation(EDIT_EVENT, {
    variables: {
      eventId: event.id,
    },
  });
  const { handleSubmit, register, errors } = useForm();

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">Set guidelines</h1>
        <form
          onSubmit={handleSubmit((variables) => {
            editEvent({ variables })
              .then(() => {
                closeModal();
              })
              .catch((err) => {
                console.log({ err });
                alert(err.message);
              });
          })}
        >
          <Box m="15px 0">
            <TextField
              name="guidelines"
              label="Guidelines (markdown)"
              defaultValue={event.guidelines}
              inputRef={register}
              fullWidth
              multiline
              variant="outlined"
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
      </Box>
    </Card>
  );
};
