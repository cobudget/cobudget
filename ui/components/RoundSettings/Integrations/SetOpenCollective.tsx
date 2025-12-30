import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import Card from "components/styled/Card";
import { Box, Button, TextField } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import toast from "react-hot-toast";
import {
  GRAPHQL_COLLECTIVE_NOT_FOUND,
  GRAPHQL_PROJECT_NOT_FOUND,
} from "../../../constants";
import { useMemo } from "react";

const EDIT_ROUND = gql`
  mutation editRound(
    $roundId: ID!
    $ocCollectiveSlug: String
    $ocProjectSlug: String
  ) {
    editRound(
      roundId: $roundId
      ocCollectiveSlug: $ocCollectiveSlug
      ocProjectSlug: $ocProjectSlug
    ) {
      id
      ocTokenStatus
      ocVerified
      ocWebhookUrl
      ocCollective {
        id
        name
        slug
        type
        parent {
          slug
        }
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

  const openCollectiveURL = useMemo(() => {
    const ocCollective = round?.ocCollective;
    if (ocCollective) {
      return `https://opencollective.com/${
        ocCollective?.parent
          ? `${ocCollective?.parent.slug}/projects/${ocCollective?.slug}`
          : ocCollective.slug
      }`;
    } else {
      return "";
    }
  }, [round]);

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-3xl">
          <FormattedMessage defaultMessage="Connect to your collective" />
        </h1>
        <form
          onSubmit={handleSubmit((variables) => {
            try {
              let ocCollectiveSlug = "";
              let ocProjectSlug = "";
              if (variables.ocCollectiveURL) {
                const urlInput =
                  variables.ocCollectiveURL.indexOf("http://") === 0 ||
                  variables.ocCollectiveURL.indexOf("https://") === 0
                    ? variables.ocCollectiveURL
                    : `https://${variables.ocCollectiveURL}`;

                const url = new URL(urlInput);
                const pathTokens = url.pathname.split("/").filter((t) => t);
                ocCollectiveSlug = pathTokens[0];
                if (pathTokens[1] === "projects") {
                  ocProjectSlug = pathTokens[2];
                }
              }

              editRound({
                ...variables,
                roundId: round.id,
                ocCollectiveSlug,
                ocProjectSlug,
              })
                .then(({ error }) => {
                  if (error) {
                    let errorMessage = intl.formatMessage({
                      defaultMessage: "Unknown Error",
                    });
                    if (
                      error.message.indexOf(GRAPHQL_COLLECTIVE_NOT_FOUND) > -1
                    ) {
                      errorMessage = intl.formatMessage({
                        defaultMessage: "Collective not found",
                      });
                    } else if (
                      error.message.indexOf(GRAPHQL_PROJECT_NOT_FOUND) > -1
                    ) {
                      errorMessage = intl.formatMessage({
                        defaultMessage: "Project not found",
                      });
                    }
                    toast.error(errorMessage);
                  } else {
                    closeModal();
                    toast.success(
                      intl.formatMessage({
                        defaultMessage: "Collective updated",
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
              name="ocCollectiveURL"
              label={intl.formatMessage({
                defaultMessage: "Collective or project URL",
              })}
              defaultValue={openCollectiveURL}
              inputRef={register("ocCollectiveURL").ref}
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
