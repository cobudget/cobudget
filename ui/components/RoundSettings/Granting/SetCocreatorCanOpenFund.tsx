import { useForm } from "react-hook-form";
import { useMutation } from "urql";
import { Box, Button } from "@mui/material";
import SelectInput from "components/SelectInput";
import Card from "components/styled/Card";
import { FormattedMessage, useIntl } from "react-intl";
import { UPDATE_GRANTING_SETTINGS } from ".";

const SetCocreatorCanOpenFund = ({ closeModal, round }) => {
  const [, updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const { handleSubmit, register } = useForm();
  const intl = useIntl();
  const canCocreatorStartFundingField = register("canCocreatorStartFunding");

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">
          <FormattedMessage
            defaultMessage="Can Co-creators open {bucketName} for funding"
            values={{
              bucketName: process.env.BUCKET_NAME_PLURAL,
            }}
          />
        </h1>

        <form
          onSubmit={handleSubmit((variables) => {
            updateGranting({
              roundId: round.id,
              canCocreatorStartFunding:
                variables.canCocreatorStartFunding === "true",
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
              name={canCocreatorStartFundingField.name}
              label={intl.formatMessage(
                {
                  defaultMessage:
                    "Co-creators can open {bucketName} for funding",
                },
                { bucketName: process.env.BUCKET_NAME_PLURAL }
              )}
              defaultValue={round.canCocreatorStartFunding ?? false}
              inputRef={canCocreatorStartFundingField.ref}
              onChange={canCocreatorStartFundingField.onChange}
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

export default SetCocreatorCanOpenFund;
