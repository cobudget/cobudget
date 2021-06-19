import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { Box, Button } from "@material-ui/core";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DayjsUtils from "@date-io/dayjs";
import dreamName from "utils/dreamName";

import Card from "components/styled/Card";
import { UPDATE_GRANTING_SETTINGS } from ".";

const SetGrantingCloses = ({ closeModal, event, currentOrg }) => {
  const [updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS, {
    variables: {
      eventId: event.id,
    },
  });
  const { handleSubmit, register } = useForm();

  const [selectedDate, handleDateChange] = React.useState(
    event.dreamCreationCloses
  );

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">
          Set {dreamName(currentOrg)} creation closes date
        </h1>

        <form
          onSubmit={handleSubmit(() => {
            updateGranting({ variables: { dreamCreationCloses: selectedDate } })
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
                label={`${dreamName(currentOrg, true)} creation close date`}
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

          <div className="flex space-x-2">
            <Button
              type="submit"
              size="large"
              variant="contained"
              color="primary"
            >
              Save
            </Button>
            {event.dreamCreationCloses && (
              <Button
                type="button"
                size="large"
                variant="contained"
                color="secondary"
                className="ml-2"
                onClick={() => {
                  updateGranting({ variables: { dreamCreationCloses: null } })
                    .then(() => {
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

export default SetGrantingCloses;
