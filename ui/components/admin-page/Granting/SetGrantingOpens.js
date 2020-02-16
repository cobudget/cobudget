import useForm from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { Box, Button } from "@material-ui/core";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DayjsUtils from "@date-io/dayjs";

import Card from "../../styled/Card";
import { UPDATE_GRANTING_SETTINGS } from "./";

const SetGrantingOpens = ({ closeModal, event }) => {
  const [updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const { handleSubmit, register, errors } = useForm();

  const [selectedDate, handleDateChange] = React.useState(event.grantingOpens);

  return (
    <Card>
      <Box p={3}>
        <h1>Set granting open date</h1>

        <form
          onSubmit={handleSubmit(variables => {
            console.log({ variables, selectedDate });
            updateGranting({ variables: { grantingOpens: selectedDate } })
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
                label="Granting opens date"
                variant="inline"
                value={selectedDate}
                onChange={handleDateChange}
                inputVariant="outlined"
                name="grantingOpens"
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

export default SetGrantingOpens;
