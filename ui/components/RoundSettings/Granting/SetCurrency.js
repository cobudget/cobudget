import { useForm } from "react-hook-form";
import { useMutation } from "urql";

import { Box, Button } from "@mui/material";
import { Alert } from "@mui/lab";

import currencies from "utils/currencies";
import SelectInput from "components/SelectInput";
import Card from "components/styled/Card";

import { UPDATE_GRANTING_SETTINGS } from ".";
import { FormattedMessage, useIntl } from "react-intl";

const SetCurrency = ({ closeModal, round }) => {
  const [, updateGranting] = useMutation(UPDATE_GRANTING_SETTINGS);
  const intl = useIntl();
  const { handleSubmit, register } = useForm();

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">
          <FormattedMessage defaultMessage="Set currency" />
        </h1>
        <Alert severity="warning">
          <FormattedMessage defaultMessage="You should not change currency after someone has added budgets or funding has started. " />
        </Alert>
        <form
          onSubmit={handleSubmit((variables) => {
            updateGranting({ ...variables, roundId: round.id })
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
            <SelectInput
              name="currency"
              label={intl.formatMessage({ defaultMessage: "Currency" })}
              defaultValue={round.currency}
              inputRef={register}
              fullWidth
            >
              {currencies.map((currency) => (
                <option value={currency} key={currency}>
                  {currency}
                </option>
              ))}
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

export default SetCurrency;
