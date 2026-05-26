import { useForm } from "react-hook-form";
import { useMutation } from "urql";

import { Box, Button } from "@material-ui/core";

import SelectInput from "components/SelectInput";
import Card from "components/styled/Card";
import { FormattedMessage, useIntl } from "react-intl";

import { UPDATE_GRANTING_SETTINGS } from ".";

const SetSilentAllocation = ({ closeModal, round }) => {
  const [, updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const intl = useIntl();
  const { handleSubmit, register } = useForm();

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">
          <FormattedMessage defaultMessage="Silent allocation" />
        </h1>

        <p className="text-gray-600 mt-2 mb-1">
          <FormattedMessage defaultMessage="When enabled, participants cannot see each other's individual contributions. Each participant only sees their own allocation. Admins still see everything." />
        </p>

        <form
          onSubmit={handleSubmit((variables) => {
            updateGranting({
              roundId: round.id,
              silentAllocation: variables.silentAllocation === "true",
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
              name="silentAllocation"
              label={intl.formatMessage({
                defaultMessage: "Silent allocation",
              })}
              defaultValue={round.silentAllocation ?? false}
              inputRef={register}
              fullWidth
            >
              <option value={true}>
                {intl.formatMessage({ defaultMessage: "Yes" })}
              </option>
              <option value={false}>
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

export default SetSilentAllocation;
