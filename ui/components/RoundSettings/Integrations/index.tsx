import {
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Modal,
} from "@material-ui/core";
import HappySpinner from "components/HappySpinner";
import { CopyIcon } from "components/Icons";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";
import { gql, useQuery } from "urql";
import { useStyles } from "../Granting";
import SettingsListItem from "../Granting/SettingsListItem";
import SetOpenCollective from "./SetOpenCollective";

const GET_ROUND_INTEGRATIONS = gql`
  query GetRoundIntegrations($roundSlug: String!, $groupSlug: String) {
    round(roundSlug: $roundSlug, groupSlug: $groupSlug) {
      id
      color
      ocWebhookUrl
      ocCollective {
        id
        name
        slug
        type
        parent {
          id
          name
          slug
        }
      }
    }
  }
`;

function Integrations() {
  const router = useRouter();
  const [{ data, error, fetching }] = useQuery({
    query: GET_ROUND_INTEGRATIONS,
    variables: { roundSlug: router.query.round, groupSlug: router.query.group },
  });
  const [openModal, setOpenModal] = useState("");
  const intl = useIntl();

  const classes = useStyles();

  const modals = useMemo(
    () => ({
      SET_OPEN_COLLECTIVE: SetOpenCollective,
    }),
    []
  );
  const ModalContent = modals[openModal];

  const handleClose = () => {
    setOpenModal("");
  };

  const round = data?.round;

  if (fetching) {
    return (
      <div className="flex justify-center items-center">
        <HappySpinner />
      </div>
    );
  }

  if (round) {
    return (
      <div className="-mb-6">
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={Boolean(openModal)}
          onClose={handleClose}
          className="flex items-start justify-center p-4 sm:pt-24 overflow-y-scroll"
        >
          <div className={classes.innerModal}>
            {openModal && (
              <ModalContent round={round} closeModal={handleClose} />
            )}
          </div>
        </Modal>

        <h2 className="text-2xl font-semibold mb-3 px-6">
          <FormattedMessage defaultMessage="Integrations" />
        </h2>
        <div className="border-t">
          <List>
            <SettingsListItem
              primary={intl.formatMessage({
                defaultMessage: "Connect round to Open Collective",
              })}
              secondary={
                round?.ocCollective ? (
                  <a
                    href={`https://opencollective.com/${round.ocCollective?.slug}`}
                    className="hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {round.ocCollective?.name}
                  </a>
                ) : (
                  intl.formatMessage({ defaultMessage: "Not Set" })
                )
              }
              isSet={!!round.ocCollective}
              canEdit={true}
              openModal={() => setOpenModal("SET_OPEN_COLLECTIVE")}
              roundColor={round.color}
            />
          </List>
          <Divider />
          <List>
            <ListItem>
              <ListItemText
                primary="Open Collective Webhook"
                secondary={
                  round.ocCollective ? (
                    <p className="w-4/5 overflow-hidden truncate whitespace-nowrap">
                      {round.ocWebhookUrl}
                    </p>
                  ) : (
                    <p className="italic">Connect to Open Collective</p>
                  )
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  disabled={!round?.ocCollective}
                  onClick={async () => {
                    try {
                      await window.navigator.clipboard.writeText(
                        round?.ocWebhookUrl
                      );
                      toast.success(
                        intl.formatMessage({
                          defaultMessage: "Copied to clipboard",
                        })
                      );
                    } catch (err) {
                      console.log("ERR", err);
                      toast.error(
                        intl.formatMessage({ defaultMessage: "Unknown error" })
                      );
                    }
                  }}
                >
                  <CopyIcon className="h-5 w-5" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </div>
      </div>
    );
  }

  return null;
}

export default Integrations;
