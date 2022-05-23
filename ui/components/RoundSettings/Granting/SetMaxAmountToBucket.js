import { useForm } from "react-hook-form";
import { useMutation } from "urql";
import { Box, Button, TextField } from "@material-ui/core";
import Card from "components/styled/Card";
import { FormattedMessage, useIntl } from "react-intl";
import { UPDATE_GRANTING_SETTINGS } from ".";

const SetMaxAmountToDream = ({ closeModal, round }) => {
  const [, updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const intl = useIntl();
  const { handleSubmit, register } = useForm();

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">
          <FormattedMessage
            defaultMessage="Set max. amount to one {bucketName} per user"
            values={{
              bucketName: process.env.BUCKET_NAME_SINGULAR,
            }}
          />
        </h1>

        <form
          onSubmit={handleSubmit((variables) => {
            updateGranting({
              roundId: round.id,
              maxAmountToBucketPerUser: Math.round(
                variables.maxAmountToBucketPerUser * 100
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
              name="maxAmountToBucketPerUser"
              label={intl.formatMessage(
                { defaultMessage: `Max. amount to one {bucketName} per user` },
                { values: { bucketName: process.env.BUCKET_NAME_SINGULAR } }
              )}
              defaultValue={round.maxAmountToBucketPerUser / 100}
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
            <FormattedMessage defaultMessage="Save" />
          </Button>
        </form>
      </Box>
    </Card>
  );
};

export default SetMaxAmountToDream;
