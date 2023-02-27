import { Divider, List, Modal } from "@material-ui/core";
import HappySpinner from "components/HappySpinner";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { gql, useQuery } from "urql";
import { useStyles } from "../Granting";
import SettingsListItem from "../Granting/SettingsListItem";
import SetOpenCollective from "./SetOpenCollective";

const GET_ROUND_INTEGRATIONS = gql`
  query GetRoundIntegrations($roundSlug: String!) {
    round(roundSlug: $roundSlug) {
      id
      color
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
    variables: { roundSlug: router.query.round },
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
    return <HappySpinner />;
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
        </div>
      </div>
    );
  }

  return null;
}

export default Integrations;
