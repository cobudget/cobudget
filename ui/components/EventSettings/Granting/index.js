import React from "react";
import { Modal, List, Divider } from "@material-ui/core";
import { gql } from "urql";

import { makeStyles } from "@material-ui/core/styles";
import dayjs from "dayjs";
import thousandSeparator from "utils/thousandSeparator";
import dreamName from "utils/dreamName";

import SettingsListItem from "./SettingsListItem";
import SetCurrency from "./SetCurrency";
import SetMaxAmountToDream from "./SetMaxAmountToDream";
import SetDreamCreationCloses from "./SetDreamCreationCloses";
import SetGrantingCloses from "./SetGrantingCloses";
import SetGrantingOpens from "./SetGrantingOpens";
import SetAllowStretchGoals from "./SetAllowStretchGoals";
import SetAbout from "./SetAbout";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    padding: theme.spacing(1),
    alignItems: "center",
    justifyContent: "center",
  },
  innerModal: {
    outline: "none",
    flex: "0 1 500px",
  },
}));

const modals = {
  SET_CURRENCY: SetCurrency,
  SET_DREAM_CREATION_CLOSES: SetDreamCreationCloses,
  SET_GRANTING_OPENS: SetGrantingOpens,
  SET_GRANTING_CLOSES: SetGrantingCloses,
  SET_MAX_AMOUNT_TO_DREAM: SetMaxAmountToDream,
  SET_ALLOW_STRETCH_GOALS: SetAllowStretchGoals,
  SET_ABOUT: SetAbout,
};

export const UPDATE_GRANTING_SETTINGS = gql`
  mutation updateGrantingSettings(
    $eventId: ID!
    $currency: String
    $maxAmountToBucketPerUser: Int
    $grantingOpens: Date
    $grantingCloses: Date
    $dreamCreationCloses: Date
    $allowStretchGoals: Boolean
  ) {
    updateGrantingSettings(
      eventId: $eventId
      currency: $currency
      maxAmountToBucketPerUser: $maxAmountToBucketPerUser
      grantingOpens: $grantingOpens
      grantingCloses: $grantingCloses
      dreamCreationCloses: $dreamCreationCloses
      allowStretchGoals: $allowStretchGoals
    ) {
      id
      currency
      maxAmountToBucketPerUser
      grantingOpens
      grantingCloses
      grantingIsOpen
      dreamCreationCloses
      dreamCreationIsOpen
      allowStretchGoals
    }
  }
`;

const EventSettingsModalGranting = ({ event, currentOrg }) => {
  const [open, setOpen] = React.useState(null);

  const handleOpen = (modal) => {
    setOpen(modal);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const classes = useStyles();

  const ModalContent = modals[open];

  const canEditSettings = true;

  return (
    <div className="-mb-6">
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={Boolean(open)}
        onClose={handleClose}
        className="flex items-start justify-center p-4 sm:pt-24 overflow-y-scroll"
      >
        <div className={classes.innerModal}>
          {open && (
            <ModalContent
              event={event}
              closeModal={handleClose}
              currentOrg={currentOrg}
            />
          )}
        </div>
      </Modal>

      <h2 className="text-2xl font-semibold mb-3 px-6">Granting</h2>
      <div className="border-t">
        <List>
          <SettingsListItem
            primary="Currency"
            secondary={event.currency}
            isSet={event.currency}
            disabled={!event.dreamCreationIsOpen}
            openModal={() => handleOpen("SET_CURRENCY")}
            canEdit={canEditSettings}
            eventColor={event.color}
            classes="px-6"
          />

          <Divider />

          <SettingsListItem
            primary="Allow stretch goals"
            secondary={event.allowStretchGoals?.toString() ?? "false"}
            isSet={typeof event.allowStretchGoals !== "undefined"}
            openModal={() => handleOpen("SET_ALLOW_STRETCH_GOALS")}
            canEdit={canEditSettings}
            eventColor={event.color}
          />

          <Divider />

          <SettingsListItem
            primary={`Max. amount to one ${dreamName(currentOrg)} per user`}
            secondary={
              event.maxAmountToBucketPerUser
                ? `${thousandSeparator(event.maxAmountToBucketPerUser / 100)} ${
                    event.currency
                  }`
                : "Not set"
            }
            isSet={!!event.maxAmountToBucketPerUser}
            openModal={() => handleOpen("SET_MAX_AMOUNT_TO_DREAM")}
            canEdit={canEditSettings}
            eventColor={event.color}
          />

          <Divider />

          <SettingsListItem
            primary={`${dreamName(currentOrg, true)} creation closes`}
            secondary={
              event.dreamCreationCloses
                ? dayjs(event.dreamCreationCloses).format(
                    "MMMM D, YYYY - h:mm a"
                  )
                : "Not set"
            }
            isSet={event.dreamCreationCloses}
            openModal={() => handleOpen("SET_DREAM_CREATION_CLOSES")}
            canEdit={canEditSettings}
            eventColor={event.color}
          />

          <Divider />

          <SettingsListItem
            primary="Granting opens"
            secondary={
              event.grantingOpens
                ? dayjs(event.grantingOpens).format("MMMM D, YYYY - h:mm a")
                : "Not set"
            }
            isSet={event.grantingOpens}
            openModal={() => handleOpen("SET_GRANTING_OPENS")}
            canEdit={canEditSettings}
            eventColor={event.color}
          />

          <Divider />

          <SettingsListItem
            primary="Granting closes"
            secondary={
              event.grantingCloses
                ? dayjs(event.grantingCloses).format("MMMM D, YYYY - h:mm a")
                : "Not set"
            }
            isSet={event.grantingCloses}
            openModal={() => handleOpen("SET_GRANTING_CLOSES")}
            canEdit={canEditSettings}
            eventColor={event.color}
          />
        </List>
      </div>
    </div>
  );
};

export default EventSettingsModalGranting;
