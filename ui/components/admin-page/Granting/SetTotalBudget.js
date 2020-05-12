import useForm from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { Box, Button, TextField, InputAdornment } from "@material-ui/core";
import Card from "../../styled/Card";

import { UPDATE_GRANTING_SETTINGS } from "./";

const SetTotalBudget = ({ closeModal, event }) => {
  const [updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS, {
    variables: {
      eventId: event.id,
    },
  });
  const { handleSubmit, register } = useForm();

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">Set total budget</h1>
        <form
          onSubmit={handleSubmit((variables) => {
            updateGranting({
              variables: { totalBudget: Number(variables.totalBudget) },
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
              name="totalBudget"
              label="Total budget"
              defaultValue={event.totalBudget}
              fullWidth
              inputRef={register}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {event.currency}
                  </InputAdornment>
                ),
                type: "number",
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

export default SetTotalBudget;
