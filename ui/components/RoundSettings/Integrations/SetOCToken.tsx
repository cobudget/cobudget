import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import Card from "components/styled/Card";
import { Box, Button, TextField } from "@material-ui/core";
import { FormattedMessage, useIntl } from "react-intl";
import toast from "react-hot-toast";
import { UNAUTHORIZED } from "../../../constants";

const EDIT_ROUND = gql`
  mutation editRound($roundId: ID!, $ocToken: String!) {
    editOCToken(roundId: $roundId, ocToken: $ocToken) {
      id
      ocTokenStatus
      ocVerified
      ocWebhookUrl
    }
  }
`;

const SetOCToken = ({ closeModal, round }) => {
  const [{ fetching }, editRound] = useMutation(EDIT_ROUND);
  const { handleSubmit, register } = useForm();
  const intl = useIntl();

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">
          <FormattedMessage defaultMessage="Add Opencollective token" />
        </h1>
        <form
          onSubmit={handleSubmit((variables) => {
            try {
              editRound({
                ...variables,
                roundId: round.id,
                ocToken: variables.ocToken,
              })
                .then(({ error }) => {
                  if (error) {
                    let errorMessage = intl.formatMessage({
                      defaultMessage: "Unknown Error",
                    });
                    if (error.message.indexOf(UNAUTHORIZED) > -1) {
                      errorMessage = intl.formatMessage({
                        defaultMessage: "Invalid token",
                      });
                    }
                    toast.error(errorMessage);
                  } else {
                    closeModal();
                    toast.success(
                      intl.formatMessage({
                        defaultMessage: "Opencollective token updated",
                      })
                    );
                  }
                })
                .catch((err) => {
                  console.log({ err });
                  alert(err.message);
                });
            } catch (err) {
              let message = "";
              if (err.message.indexOf("Invalid URL") > -1) {
                message = intl.formatMessage({ defaultMessage: "Invalid URL" });
              }
              toast.error(
                message ||
                  err.message ||
                  intl.formatMessage({ defaultMessage: "Unknown Error" })
              );
            }
          })}
        >
          <Box m="15px 0">
            <TextField
              name="ocToken"
              label={intl.formatMessage({
                defaultMessage: "Your opencollective token",
              })}
              inputRef={register}
              fullWidth
              variant="outlined"
            />
          </Box>

          <Button
            type="submit"
            size="large"
            variant="contained"
            color="primary"
            disabled={fetching}
          >
            <FormattedMessage defaultMessage="Save" />
          </Button>
        </form>
      </Box>
    </Card>
  );
};

export default SetOCToken;
