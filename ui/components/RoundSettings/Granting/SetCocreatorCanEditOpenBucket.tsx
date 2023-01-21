import { useForm } from "react-hook-form";
import { useMutation } from "urql";
import { Box, Button } from "@material-ui/core";
import SelectInput from "components/SelectInput";
import Card from "components/styled/Card";
import { FormattedMessage, useIntl } from "react-intl";
import { UPDATE_GRANTING_SETTINGS } from ".";

const SetCocreatorCanEditOpenBucket = ({ closeModal, round }) => {
  const [, updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const { handleSubmit, register } = useForm();
  const intl = useIntl();

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">
          <FormattedMessage
            defaultMessage="Co-creators can edit their {bucketName} during funding"
            values={{
              bucketName: process.env.BUCKET_NAME_SINGULAR,
            }}
          />
        </h1>

        <form
          onSubmit={handleSubmit((variables) => {
            updateGranting({
              roundId: round.id,
              canCocreatorEditOpenBuckets: variables.canCocreatorEditOpenBuckets === "true",
            })
              .then(({ data }) => {
                closeModal();
              })
              .catch((err) => {
                console.log({ err });
                alert(err.message);
              });
          })}
        >
          <Box m="15px 0">
            <SelectInput
              name="canCocreatorEditOpenBuckets"
              label={intl.formatMessage(
                {
                  defaultMessage:
                    "Co-creators can edit their {bucketName} during funding",
                },
                { bucketName: process.env.BUCKET_NAME_PLURAL }
              )}
              defaultValue={round.canCocreatorEditOpenBuckets ?? false}
              inputRef={register}
              fullWidth
            >
              <option value={"true"}>
                {intl.formatMessage({ defaultMessage: "Yes" })}
              </option>
              <option value={"false"}>
                {intl.formatMessage({ defaultMessage: "No" })}
              </option>
            </SelectInput>
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

export default SetCocreatorCanEditOpenBucket;
