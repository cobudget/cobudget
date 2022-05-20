import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "urql";
import { Box, Button } from "@material-ui/core";
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DayjsUtils from "@date-io/dayjs";
import capitalize from "utils/capitalize";
import Card from "components/styled/Card";
import { UPDATE_GRANTING_SETTINGS } from ".";
import { FormattedMessage, useIntl } from "react-intl";

const SetBucketCreationCloses = ({ closeModal, round }) => {
  const [, updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const { handleSubmit, register } = useForm();
  const intl = useIntl();

  const [selectedDate, handleDateChange] = React.useState(
    round.bucketCreationCloses
  );

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">
          <FormattedMessage 
            defaultMessage="Set {bucketName} creation closes date"
            values={{
              bucketName: process.env.BUCKET_NAME_SINGULAR
            }}
          />
        </h1>

        <form
          onSubmit={handleSubmit(() => {
            updateGranting({
              bucketCreationCloses: selectedDate,
              roundId: round.id,
            })
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
                label={
                  intl.formatMessage(
                    { defaultMessage: "{bucketName} creation close date" },
                    { bucketName: capitalize(process.env.BUCKET_NAME_SINGULAR) }
                  )
                }
                variant="inline"
                value={selectedDate}
                onChange={handleDateChange}
                inputVariant="outlined"
                name="bucketCreationCloses"
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
            {round.bucketCreationCloses && (
              <Button
                type="button"
                size="large"
                variant="contained"
                color="secondary"
                className="ml-2"
                onClick={() => {
                  updateGranting({
                    roundId: round.id,
                    bucketCreationCloses: null,
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

export default SetBucketCreationCloses;
