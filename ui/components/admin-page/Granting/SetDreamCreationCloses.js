import useForm from "react-hook-form";
import { useMutation } from "@apollo/react-hooks";
import { Box, Button } from "@material-ui/core";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DayjsUtils from "@date-io/dayjs";

import Card from "../../styled/Card";
import { UPDATE_GRANTING_SETTINGS } from "./";

const SetGrantingCloses = ({ closeModal, event }) => {
  const [updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const { handleSubmit, register } = useForm();

  const [selectedDate, handleDateChange] = React.useState(
    event.dreamCreationCloses
  );

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">Set dream creation closes date</h1>

        <form
          onSubmit={handleSubmit(variables => {
            updateGranting({ variables: { dreamCreationCloses: selectedDate } })
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
            <MuiPickersUtilsProvider utils={DayjsUtils}>
              <DateTimePicker
                label="Dream creation close date"
                variant="inline"
                value={selectedDate}
                onChange={handleDateChange}
                inputVariant="outlined"
                name="dreamCreationCloses"
                inputRef={register}
                fullWidth
              />
            </MuiPickersUtilsProvider>
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

export default SetGrantingCloses;
