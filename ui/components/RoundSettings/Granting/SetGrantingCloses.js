import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "urql";
import { Box, Button } from "@material-ui/core";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DayjsUtils from "@date-io/dayjs";

import Card from "components/styled/Card";
import { UPDATE_GRANTING_SETTINGS } from ".";
import { FormattedMessage, useIntl } from "react-intl";

const SetGrantingCloses = ({ closeModal, round }) => {
  const [, updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const { handleSubmit, register } = useForm();
  const intl = useIntl();

  const [selectedDate, handleDateChange] = React.useState(round.grantingCloses);

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">
          <FormattedMessage defaultMessage="Set funding close date" />
        </h1>

        <form
          onSubmit={handleSubmit(() => {
            updateGranting({
              grantingCloses: selectedDate,
              roundId: round.id,
            })
              .then(() => {
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
                label={intl.formatMessage({
                  defaultMessage: "Funding close date",
                })}
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

          <div className="flex space-x-2">
            <Button
              type="submit"
              size="large"
              variant="contained"
              color="primary"
            >
              <FormattedMessage defaultMessage="Save" />
            </Button>
            {round.grantingCloses && (
              <Button
                type="button"
                size="large"
                variant="contained"
                color="secondary"
                className="ml-2"
                onClick={() => {
                  updateGranting({
                    roundId: round.id,
                    grantingCloses: null,
                  })
                    .then(() => {
                      closeModal();
                    })
                    .catch((err) => {
                      console.log({ err });
                      alert(err.message);
                    });
                }}
              >
                <FormattedMessage defaultMessage="Clear date" />
              </Button>
            )}
          </div>
        </form>
      </Box>
    </Card>
  );
};

export default SetGrantingCloses;
