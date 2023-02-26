import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import Card from "components/styled/Card";
import { Box, Button, TextField } from "@material-ui/core";
import { FormattedMessage, useIntl } from "react-intl";

const EDIT_ROUND = gql`
  mutation editRound($roundId: ID!, $ocCollectiveSlug: String) {
    editRound(roundId: $roundId, ocCollectiveSlug: $ocCollectiveSlug) {
      id
      ocCollective {
        id
        name
        slug
      }
    }
  }
`;

const SetOpenCollective = ({ closeModal, round }) => {
  const [, editRound] = useMutation(EDIT_ROUND);
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
          >
            <FormattedMessage defaultMessage="Save" />
          </Button>
        </form>
      </Box>
    </Card>
  );
};

export default SetOpenCollective;
