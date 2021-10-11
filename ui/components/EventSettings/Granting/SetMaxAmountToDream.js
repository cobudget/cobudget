import { useForm } from "react-hook-form";
import { useMutation } from "urql";
import { Box, Button, TextField } from "@material-ui/core";
import Card from "components/styled/Card";
import dreamName from "utils/dreamName";

import { UPDATE_GRANTING_SETTINGS } from ".";

const SetMaxAmountToDream = ({ closeModal, event, currentOrg }) => {
  const [, updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const { handleSubmit, register } = useForm();

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">
          Set max. amount to one {dreamName(currentOrg)} per user
        </h1>

        <form
          onSubmit={handleSubmit((variables) => {
            updateGranting({
              eventId: event.id,
              maxAmountToDreamPerUser: Math.round(
                variables.maxAmountToDreamPerUser * 100
              ),
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
              label={`Max. amount to one ${dreamName(currentOrg)} per user`}
              defaultValue={event.maxAmountToDreamPerUser / 100}
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

export default SetMaxAmountToDream;
