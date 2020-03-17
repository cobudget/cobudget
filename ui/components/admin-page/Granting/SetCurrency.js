import useForm from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";

import { Box, Button } from "@material-ui/core";
import { Alert } from "@material-ui/lab";

import SelectInput from "../../SelectInput";
import Card from "../../styled/Card";

import { UPDATE_GRANTING_SETTINGS } from "./";

const SetCurrency = ({ closeModal, event }) => {
  const [updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const { handleSubmit, register, errors } = useForm();

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">Set currency</h1>
        <Alert severity="warning">
          Changing currency will also reset total budget and grant value. You
          can't change this after dream creation closes.
        </Alert>
        <form
          onSubmit={handleSubmit(variables => {
            updateGranting({ variables })
              .then(({ data }) => {
                // console.log({ data });
                closeModal();
              })
              .catch(err => {
                console.log({ err });
                alert(err.message);
              });
          })}
        >
          <Box m="15px 0">
            <SelectInput
              name="currency"
              label="Currency"
              defaultValue={event.currency}
              inputRef={register}
              fullWidth
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="SEK">SEK</option>
              <option value="DKK">DKK</option>
            </SelectInput>
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
