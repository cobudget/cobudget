import { useForm } from "react-hook-form";
import { useMutation } from "urql";

import { Box, Button } from "@material-ui/core";

import SelectInput from "components/SelectInput";
import Card from "components/styled/Card";
import { FormattedMessage, useIntl } from "react-intl";

import { UPDATE_GRANTING_SETTINGS } from ".";

const SetWithdrawalEnabled = ({ closeModal, round }) => {
  const [, updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const intl = useIntl();
  const { handleSubmit, register } = useForm();

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">
          <FormattedMessage defaultMessage="Allow withdrawal" />
        </h1>

        <p className="text-gray-600 mt-2 mb-1">
          <FormattedMessage defaultMessage="When enabled, participants can withdraw funds they have already contributed to a bucket and reallocate them elsewhere. Each participant can only withdraw up to the amount they personally contributed to that bucket." />
        </p>

        <form
          onSubmit={handleSubmit((variables) => {
            updateGranting({
              roundId: round.id,
              withdrawalEnabled: variables.withdrawalEnabled === "true",
            })
              .then(({ data }) => {
                console.log({ data });
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
              name="withdrawalEnabled"
              label={intl.formatMessage({
                defaultMessage: "Withdrawal status",
              })}
              defaultValue={round.withdrawalEnabled ?? false}
              inputRef={register}
              fullWidth
            >
              <option value={false}>
                {intl.formatMessage({ defaultMessage: "Disabled" })}
              </option>
              <option value={true}>
                {intl.formatMessage({ defaultMessage: "Enabled" })}
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

export default SetWithdrawalEnabled;
