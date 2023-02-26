import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import Card from "components/styled/Card";
import { Box, Button, TextField } from "@material-ui/core";
import { FormattedMessage, useIntl } from "react-intl";
import toast from "react-hot-toast";
import { GRAPHQL_COLLECTIVE_NOT_FOUND } from "../../../constants";

const EDIT_ROUND = gql`
  mutation editRound($roundId: ID!, $ocCollectiveSlug: String) {
    editRound(roundId: $roundId, ocCollectiveSlug: $ocCollectiveSlug) {
      id
      ocCollective {
        id
        name
        slug
        stats {
          balance {
            valueInCents
            currency
          }
        }
      }
    }
  }
`;

const SetOpenCollective = ({ closeModal, round }) => {
  const [{ fetching }, editRound] = useMutation(EDIT_ROUND);
  const { handleSubmit, register } = useForm();
  const intl = useIntl();

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">
          <FormattedMessage defaultMessage="Connect Open Collective" />
        </h1>
        <form
          onSubmit={handleSubmit((variables) => {
            editRound({ ...variables, roundId: round.id })
              .then(({ error }) => {
                if (error) {
                  toast.error(
                    error.message.indexOf(GRAPHQL_COLLECTIVE_NOT_FOUND) > -1
                      ? intl.formatMessage({
                          defaultMessage: "Collective not found",
                        })
                      : intl.formatMessage({ defaultMessage: "Unknown Error" })
                  );
                } else {
                  closeModal();
                  toast.success(
                    intl.formatMessage({ defaultMessage: "Collective updated" })
                  );
                }
              })
              .catch((err) => {
                console.log({ err });
                alert(err.message);
              });
          })}
        >
          <Box m="15px 0">
            <TextField
              name="ocCollectiveSlug"
              label={intl.formatMessage({ defaultMessage: "Collective Slug" })}
              defaultValue={round.ocCollective?.slug}
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

export default SetOpenCollective;
