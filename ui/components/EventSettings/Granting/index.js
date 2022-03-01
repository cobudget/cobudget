import React from "react";
import { Modal, List, Divider } from "@material-ui/core";
import { gql } from "urql";

import { makeStyles } from "@material-ui/core/styles";
import dayjs from "dayjs";
import thousandSeparator from "utils/thousandSeparator";

import SettingsListItem from "./SettingsListItem";
import SetCurrency from "./SetCurrency";
import SetMaxAmountToBucket from "./SetMaxAmountToBucket";
import SetBucketCreationCloses from "./SetBucketCreationCloses";
import SetGrantingCloses from "./SetGrantingCloses";
import SetGrantingOpens from "./SetGrantingOpens";
import SetRequireBucketApproval from "./SetRequireBucketApproval";
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
  SET_BUCKET_CREATION_CLOSES: SetBucketCreationCloses,
  SET_GRANTING_OPENS: SetGrantingOpens,
  SET_GRANTING_CLOSES: SetGrantingCloses,
  SET_MAX_AMOUNT_TO_BUCKET: SetMaxAmountToBucket,
  SET_ALLOW_STRETCH_GOALS: SetAllowStretchGoals,
  SET_REQUIRE_BUCKET_APPROVAL: SetRequireBucketApproval,
  SET_ABOUT: SetAbout,
};

export const UPDATE_GRANTING_SETTINGS = gql`
  mutation updateGrantingSettings(
    $collectionId: ID!
    $currency: String
    $maxAmountToBucketPerUser: Int
    $grantingOpens: Date
    $grantingCloses: Date
    $bucketCreationCloses: Date
    $allowStretchGoals: Boolean
    $requireBucketApproval: Boolean
  ) {
    updateGrantingSettings(
      collectionId: $collectionId
      currency: $currency
      maxAmountToBucketPerUser: $maxAmountToBucketPerUser
      grantingOpens: $grantingOpens
      grantingCloses: $grantingCloses
      bucketCreationCloses: $bucketCreationCloses
      allowStretchGoals: $allowStretchGoals
      requireBucketApproval: $requireBucketApproval
    ) {
      id
      currency
      maxAmountToBucketPerUser
      grantingOpens
      grantingCloses
      grantingIsOpen
      bucketCreationCloses
      bucketCreationIsOpen
      allowStretchGoals
      requireBucketApproval
    }
  }
`;

const EventSettingsModalGranting = ({ collection, currentOrg }) => {
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
              collection={collection}
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
            secondary={collection.currency}
            isSet={collection.currency}
            disabled={!collection.bucketCreationIsOpen}
            openModal={() => handleOpen("SET_CURRENCY")}
            canEdit={canEditSettings}
            eventColor={collection.color}
            classes="px-6"
          />

          <Divider />

          <SettingsListItem
            primary="Allow stretch goals"
            secondary={collection.allowStretchGoals?.toString() ?? "false"}
            isSet={typeof collection.allowStretchGoals !== "undefined"}
            openModal={() => handleOpen("SET_ALLOW_STRETCH_GOALS")}
            canEdit={canEditSettings}
            eventColor={collection.color}
          />

          <Divider />

          <SettingsListItem
            primary="Require moderator approval of buckets before funding"
            secondary={collection.requireBucketApproval?.toString() ?? "false"}
            isSet={typeof collection.requireBucketApproval !== "undefined"}
            openModal={() => handleOpen("SET_REQUIRE_BUCKET_APPROVAL")}
            canEdit={canEditSettings}
            eventColor={collection.color}
          />

          <Divider />

          <SettingsListItem
            primary={`Max. amount to one bucket per user`}
            secondary={
              collection.maxAmountToBucketPerUser
                ? `${thousandSeparator(
                    collection.maxAmountToBucketPerUser / 100
                  )} ${collection.currency}`
                : "Not set"
            }
            isSet={!!collection.maxAmountToBucketPerUser}
            openModal={() => handleOpen("SET_MAX_AMOUNT_TO_BUCKET")}
            canEdit={canEditSettings}
            eventColor={collection.color}
          />

          <Divider />

          <SettingsListItem
            primary={`Bucket creation closes`}
            secondary={
              collection.bucketCreationCloses
                ? dayjs(collection.bucketCreationCloses).format(
                    "MMMM D, YYYY - h:mm a"
                  )
                : "Not set"
            }
            isSet={collection.bucketCreationCloses}
            openModal={() => handleOpen("SET_BUCKET_CREATION_CLOSES")}
            canEdit={canEditSettings}
            eventColor={collection.color}
          />

          <Divider />

          <SettingsListItem
            primary="Granting opens"
            secondary={
              collection.grantingOpens
                ? dayjs(collection.grantingOpens).format(
                    "MMMM D, YYYY - h:mm a"
                  )
                : "Not set"
            }
            isSet={collection.grantingOpens}
            openModal={() => handleOpen("SET_GRANTING_OPENS")}
            canEdit={canEditSettings}
            eventColor={collection.color}
          />

          <Divider />

          <SettingsListItem
            primary="Granting closes"
            secondary={
              collection.grantingCloses
                ? dayjs(collection.grantingCloses).format(
                    "MMMM D, YYYY - h:mm a"
                  )
                : "Not set"
            }
            isSet={collection.grantingCloses}
            openModal={() => handleOpen("SET_GRANTING_CLOSES")}
            canEdit={canEditSettings}
            eventColor={collection.color}
          />
        </List>
      </div>
    </div>
  );
};

export default EventSettingsModalGranting;
