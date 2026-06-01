import { useForm } from "react-hook-form";
import { useMutation } from "urql";

import { Box, Button } from "@material-ui/core";

import SelectInput from "components/SelectInput";
import Card from "components/styled/Card";
import { FormattedMessage, useIntl } from "react-intl";

import { UPDATE_GRANTING_SETTINGS } from ".";

const SetAllocationPaused = ({ closeModal, round }) => {
  const [, updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const intl = useIntl();
  const { handleSubmit, register } = useForm();

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">
          <FormattedMessage defaultMessage="Pause allocation" />
        </h1>

        <p className="text-gray-600 mt-2 mb-1">
          <FormattedMessage defaultMessage="When paused, participants cannot submit new allocations. Use this during the read-out to freeze contributions temporarily. Resume to allow further allocation. The funding close date still acts as a hard deadline." />
        </p>

        <form
          onSubmit={handleSubmit((variables) => {
            updateGranting({
              roundId: round.id,
              allocationPaused: variables.allocationPaused === "true",
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
              name="allocationPaused"
              label={intl.formatMessage({
                defaultMessage: "Allocation status",
              })}
              defaultValue={round.allocationPaused ?? false}
              inputRef={register}
              fullWidth
            >
              <option value={false}>
                {intl.formatMessage({ defaultMessage: "Active (open)" })}
              </option>
              <option value={true}>
                {intl.formatMessage({ defaultMessage: "Paused" })}
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

export default SetAllocationPaused;
