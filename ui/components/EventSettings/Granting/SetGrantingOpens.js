import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "urql";
import { Box, Button } from "@material-ui/core";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DayjsUtils from "@date-io/dayjs";

import Card from "components/styled/Card";
import { UPDATE_GRANTING_SETTINGS } from ".";

const SetGrantingOpens = ({ closeModal, event }) => {
  const [, updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const { handleSubmit, register } = useForm();

  const [selectedDate, handleDateChange] = React.useState(event.grantingOpens);

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">Set granting open date</h1>

        <form
          onSubmit={handleSubmit(() => {
            updateGranting({ grantingOpens: selectedDate, eventId: event.id })
              .then(() => {
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

          <div className="flex space-x-2">
            <Button
              type="submit"
              size="large"
              variant="contained"
              color="primary"
            >
              Save
            </Button>

            {event.grantingOpens && (
              <Button
                type="button"
                size="large"
                variant="contained"
                color="secondary"
                className="ml-2"
                onClick={() => {
                  updateGranting({ eventId: event.id, grantingOpens: null })
                    .then(() => {
                      // console.log({ data });
                      closeModal();
                    })
                    .catch((err) => {
                      console.log({ err });
                      alert(err.message);
                    });
                }}
              >
                Clear date
              </Button>
            )}
          </div>
        </form>
      </Box>
    </Card>
  );
};

export default SetGrantingOpens;
