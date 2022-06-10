import { useForm } from "react-hook-form";
import { useMutation } from "urql";

import { Box, Button } from "@material-ui/core";

import SelectInput from "components/SelectInput";
import Card from "components/styled/Card";
import { FormattedMessage, useIntl } from "react-intl";

import { UPDATE_GRANTING_SETTINGS } from ".";

const SetAllowStretchGoals = ({ closeModal, round }) => {
  const [, updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const intl = useIntl();
  const { handleSubmit, register } = useForm();

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">
          <FormattedMessage defaultMessage="Allow stretch goals" />
        </h1>

        <form
          onSubmit={handleSubmit((variables) => {
            updateGranting({
              roundId: round.id,
              allowStretchGoals: variables.allowStretchGoals === "true",
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
              name="allowStretchGoals"
              label={intl.formatMessage({
                defaultMessage: "Allow stretch goals",
              })}
              defaultValue={round.allowStretchGoals ?? false}
              inputRef={register}
              fullWidth
            >
              <option value={true}>
                {intl.formatMessage({ defaultMessage: "true" })}
              </option>
              <option value={false}>
                {intl.formatMessage({ defaultMessage: "false" })}
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

export default SetAllowStretchGoals;
