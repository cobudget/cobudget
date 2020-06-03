import { useForm } from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { Box, Button, TextField } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Card from "../styled/Card";

import { UPDATE_GRANTING_SETTINGS } from ".";

const SetCurrency = ({ closeModal, event }) => {
  const [updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS, {
    variables: {
      eventId: event.id,
    },
  });
  const { handleSubmit, register } = useForm();

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">Set grants per member</h1>
        <Alert severity="warning">
          Changing grants per member will also reset grant value.
        </Alert>
        <form
          onSubmit={handleSubmit((variables) => {
            updateGranting({
              variables: { grantsPerMember: Number(variables.grantsPerMember) },
            })
              .then(({ data }) => {
                // console.log({ data });
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
              name="grantsPerMember"
              label="Grants per member"
              defaultValue={event.grantsPerMember}
              fullWidth
              inputRef={register}
              InputProps={{
                type: "number",
                min: 1,
              }}
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

export default SetCurrency;
