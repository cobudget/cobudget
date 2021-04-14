import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import { Box, Button, TextField } from "@material-ui/core";
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
        <h1 className="text-3xl">Set max. amount to one dream per user</h1>

        <form
          onSubmit={handleSubmit((variables) => {
            updateGranting({
              variables: {
                maxAmountToDreamPerUser: Math.round(
                  variables.maxAmountToDreamPerUser * 100
                ),
              },
            })
              .then(() => closeModal())
              .catch((err) => {
                console.log({ err });
                alert(err.message);
              });
          })}
        >
          <Box m="15px 0">
            <TextField
              name="maxAmountToDreamPerUser"
              label="Max. amount to one dream per user"
              defaultValue={event.maxAmountToDreamPerUser}
              fullWidth
              inputRef={register}
              InputProps={{
                type: "number",
                min: "1",
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
