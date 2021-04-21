import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { Box, Button, TextField } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Card from "components/styled/Card";

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
        <h1 className="text-3xl">Set max tokens to one dream</h1>

        <form
          onSubmit={handleSubmit((variables) => {
            updateGranting({
              variables: {
                maxGrantsToDream: Number(variables.maxGrantsToDream),
              },
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
              name="maxGrantsToDream"
              label="Max tokens to one dream per user"
              defaultValue={event.maxGrantsToDream}
              fullWidth
              inputRef={register}
              InputProps={{
                type: "number",
                min: 1,
                max: event.grantsPerMember,
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
