import React from "react";
import { Modal, List, Divider } from "@material-ui/core";
import { gql, useQuery } from "urql";
import { useRouter } from "next/router";
import { makeStyles } from "@material-ui/core/styles";
import dayjs from "dayjs";
import { FormattedMessage, useIntl } from "react-intl";
import capitalize from "utils/capitalize";
import HappySpinner from "components/HappySpinner";

import SettingsListItem from "./SettingsListItem";
import SetCurrency from "./SetCurrency";
import SetMaxAmountToBucket from "./SetMaxAmountToBucket";
import SetBucketCreationCloses from "./SetBucketCreationCloses";
import SetGrantingCloses from "./SetGrantingCloses";
import SetGrantingOpens from "./SetGrantingOpens";
import SetRequireBucketApproval from "./SetRequireBucketApproval";
import SetAllowStretchGoals from "./SetAllowStretchGoals";
import SetAbout from "./SetAbout";
import SetStripe from "./SetStripe";
import SetDirectFunding from "./SetDirectFunding";
import FormattedCurrency from "components/FormattedCurrency";

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
  SET_STRIPE: SetStripe,
  SET_DIRECT_FUNDING: SetDirectFunding,
};

const GET_ROUND_FUNDING_SETTINGS = gql`
  query GetRoundFundingSettings($roundSlug: String!, $groupSlug: String!) {
    round(roundSlug: $roundSlug, groupSlug: $groupSlug) {
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
      stripeIsConnected
      directFundingEnabled
      directFundingTerms
    }
  }
`;

export const UPDATE_GRANTING_SETTINGS = gql`
  mutation updateGrantingSettings(
    $roundId: ID!
    $currency: String
    $maxAmountToBucketPerUser: Int
    $grantingOpens: Date
    $grantingCloses: Date
    $bucketCreationCloses: Date
    $allowStretchGoals: Boolean
    $requireBucketApproval: Boolean
    $directFundingEnabled: Boolean
    $directFundingTerms: String
  ) {
    updateGrantingSettings(
      roundId: $roundId
      currency: $currency
      maxAmountToBucketPerUser: $maxAmountToBucketPerUser
      grantingOpens: $grantingOpens
      grantingCloses: $grantingCloses
      bucketCreationCloses: $bucketCreationCloses
      allowStretchGoals: $allowStretchGoals
      requireBucketApproval: $requireBucketApproval
      directFundingEnabled: $directFundingEnabled
      directFundingTerms: $directFundingTerms
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
      directFundingEnabled
      directFundingTerms
    }
  }
`;

const RoundSettingsModalGranting = ({ currentGroup }) => {
  const router = useRouter();

  const [open, setOpen] = React.useState(null);
  const intl = useIntl();

  const [{ data, error, fetching }] = useQuery({
    query: GET_ROUND_FUNDING_SETTINGS,
    variables: { groupSlug: router.query.group, roundSlug: router.query.round },
  });

  const round = data?.round;

  const handleOpen = (modal) => {
    setOpen(modal);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const classes = useStyles();

  const ModalContent = modals[open];

  const canEditSettings = true;

  if (error) {
    console.error(error);
    return <div>{error.message}</div>;
  }

  if (fetching || !round) {
    return <HappySpinner className="mx-auto" />;
  }

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
              round={round}
              closeModal={handleClose}
              currentGroup={currentGroup}
            />
          )}
        </div>
      </Modal>

      <h2 className="text-2xl font-semibold mb-3 px-6">
        <FormattedMessage defaultMessage="Funding" />
      </h2>
      <div className="border-t">
        <List>
          <SettingsListItem
            primary={intl.formatMessage({ defaultMessage: "Currency" })}
            secondary={round.currency}
            isSet={round.currency}
            disabled={!round.bucketCreationIsOpen}
            openModal={() => handleOpen("SET_CURRENCY")}
            canEdit={canEditSettings}
            roundColor={round.color}
          />

          <Divider />

          <SettingsListItem
            primary={intl.formatMessage({
              defaultMessage: "Allow stretch goals",
            })}
            secondary={round.allowStretchGoals?.toString() ?? "false"}
            isSet={typeof round.allowStretchGoals !== "undefined"}
            openModal={() => handleOpen("SET_ALLOW_STRETCH_GOALS")}
            canEdit={canEditSettings}
            roundColor={round.color}
          />

          <Divider />

          <SettingsListItem
            primary={intl.formatMessage(
              {
                defaultMessage:
                  "Require moderator approval of {bucketName} before funding",
              },
              {
                bucketName: process.env.BUCKET_NAME_PLURAL,
              }
            )}
            secondary={round.requireBucketApproval?.toString() ?? "false"}
            isSet={typeof round.requireBucketApproval !== "undefined"}
            openModal={() => handleOpen("SET_REQUIRE_BUCKET_APPROVAL")}
            canEdit={canEditSettings}
            roundColor={round.color}
          />

          <Divider />

          <SettingsListItem
            primary={intl.formatMessage(
              {
                defaultMessage: "Max. amount to one {bucketName} per user",
              },
              {
                bucketName: process.env.BUCKET_NAME_SINGULAR,
              }
            )}
            secondary={
              round.maxAmountToBucketPerUser ? (
                <FormattedCurrency
                  value={round.maxAmountToBucketPerUser}
                  currency={round.currency}
                />
              ) : (
                <FormattedMessage defaultMessage="Not set" />
              )
            }
            isSet={!!round.maxAmountToBucketPerUser}
            openModal={() => handleOpen("SET_MAX_AMOUNT_TO_BUCKET")}
            canEdit={canEditSettings}
            roundColor={round.color}
          />

          <Divider />

          <SettingsListItem
            primary={intl.formatMessage(
              { defaultMessage: "{bucketName} creation closes" },
              {
                bucketName: capitalize(process.env.BUCKET_NAME_PLURAL),
              }
            )}
            secondary={
              round.bucketCreationCloses
                ? dayjs(round.bucketCreationCloses).format(
                    "MMMM D, YYYY - h:mm a"
                  )
                : intl.formatMessage({ defaultMessage: "Not set" })
            }
            isSet={round.bucketCreationCloses}
            openModal={() => handleOpen("SET_BUCKET_CREATION_CLOSES")}
            canEdit={canEditSettings}
            roundColor={round.color}
          />

          <Divider />

          <SettingsListItem
            primary={intl.formatMessage({ defaultMessage: "Funding opens" })}
            secondary={
              round.grantingOpens
                ? dayjs(round.grantingOpens).format("MMMM D, YYYY - h:mm a")
                : intl.formatMessage({ defaultMessage: "Not set" })
            }
            isSet={round.grantingOpens}
            openModal={() => handleOpen("SET_GRANTING_OPENS")}
            canEdit={canEditSettings}
            roundColor={round.color}
          />

          <Divider />

          <SettingsListItem
            primary={intl.formatMessage({ defaultMessage: "Funding closes" })}
            secondary={
              round.grantingCloses
                ? dayjs(round.grantingCloses).format("MMMM D, YYYY - h:mm a")
                : intl.formatMessage({ defaultMessage: "Not set" })
            }
            isSet={round.grantingCloses}
            openModal={() => handleOpen("SET_GRANTING_CLOSES")}
            canEdit={canEditSettings}
            roundColor={round.color}
          />

          {currentGroup?.experimentalFeatures && (
            <>
              <Divider />

              <SettingsListItem
                primary={intl.formatMessage({
                  defaultMessage: "Connect with Stripe",
                })}
                secondary={round.stripeIsConnected?.toString() ?? "false"}
                isSet={round.stripeIsConnected}
                openModal={() => handleOpen("SET_STRIPE")}
                canEdit={canEditSettings}
                roundColor={round.color}
              />

              <Divider />

              <SettingsListItem
                primary={intl.formatMessage({
                  defaultMessage: "Accept direct funding",
                })}
                secondary={round.directFundingEnabled?.toString() ?? "false"}
                isSet={round.directFundingEnabled}
                openModal={() => handleOpen("SET_DIRECT_FUNDING")}
                canEdit={canEditSettings}
                roundColor={round.color}
              />
            </>
          )}
        </List>
      </div>
    </div>
  );
};

export default RoundSettingsModalGranting;
