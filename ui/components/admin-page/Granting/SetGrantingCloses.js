import useForm from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { Box, Button } from "@material-ui/core";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DayjsUtils from "@date-io/dayjs";

import Card from "../../styled/Card";
import { UPDATE_GRANTING_SETTINGS } from "./";

const SetGrantingCloses = ({ closeModal, event }) => {
  const [updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS, {
    variables: {
      eventId: event.id,
    },
  });
  const { handleSubmit, register } = useForm();

  const [selectedDate, handleDateChange] = React.useState(event.grantingCloses);

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">Set granting close date</h1>

        <form
          onSubmit={handleSubmit((variables) => {
            updateGranting({ variables: { grantingCloses: selectedDate } })
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
            <MuiPickersUtilsProvider utils={DayjsUtils}>
              <DateTimePicker
                label="Granting close date"
                variant="inline"
                value={selectedDate}
                onChange={handleDateChange}
                inputVariant="outlined"
                name="grantingCloses"
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
