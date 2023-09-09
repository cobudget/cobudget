import {
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Modal,
} from "@material-ui/core";
import Button from "components/Button";
import HappySpinner from "components/HappySpinner";
import { CopyIcon, VerifiedIcon } from "components/Icons";
import { HIDDEN_TEXT, TOKEN_STATUS } from "../../../constants";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";
import { gql, useMutation, useQuery } from "urql";
import { useStyles } from "../Granting";
import SettingsListItem from "../Granting/SettingsListItem";
import SetOpenCollective from "./SetOpenCollective";
import SetOCToken from "./SetOCToken";

const GET_ROUND_INTEGRATIONS = gql`
  query GetRoundIntegrations($roundSlug: String!, $groupSlug: String) {
    round(roundSlug: $roundSlug, groupSlug: $groupSlug) {
      id
      color
      ocTokenStatus
      ocVerified
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

const VERIFY_OPENCOLLECTIVE = gql`
  mutation VerifyOpencollective($roundId: ID!) {
    verifyOpencollective(roundId: $roundId) {
      id
      ocTokenStatus
      ocVerified
      ocWebhookUrl
    }
  }
`;

const SYNC_OC_EXPENSES = gql`
  mutation SyncOCExpenses($id: ID!, $limit: Int!, $offset: Int!) {
    syncOCExpenses(id: $id, limit: $limit, offset: $offset) {
      status
    }
  }
`;

const REMOVE_DELETED__OC_EXPENSES = gql`
  mutation DeleteRemovedOCExpenses($id: ID!) {
    removeDeletedOCExpenses(id: $id) {
      status
    }
  }
`;

const GET_EXPENSES_COUNT = gql`
  query ExpensesCount($roundId: ID!) {
    expensesCount(roundId: $roundId) {
      count
      error
    }
  }
`;

function Integrations() {
  const router = useRouter();
  const [{ data, error, fetching }] = useQuery({
    query: GET_ROUND_INTEGRATIONS,
    variables: { roundSlug: router.query.round, groupSlug: router.query.group },
  });

  const [{ fetching: verifying }, verifyOpencollective] = useMutation(
    VERIFY_OPENCOLLECTIVE
  );
  const [{ fetching: addingAndUpdatingExpenses }, syncOCExpenses] = useMutation(
    SYNC_OC_EXPENSES
  );
  const [
    { fetching: removingDeletedExpenses },
    removeDeletedOCExpenses,
  ] = useMutation(REMOVE_DELETED__OC_EXPENSES);
  const syncing = addingAndUpdatingExpenses || removingDeletedExpenses;

  const [openModal, setOpenModal] = useState("");
  const intl = useIntl();

  const classes = useStyles();

  const modals = useMemo(
    () => ({
      SET_OPEN_COLLECTIVE: SetOpenCollective,
      SET_OC_TOKEN: SetOCToken,
    }),
    []
  );
  const ModalContent = modals[openModal];

  const handleClose = () => {
    setOpenModal("");
  };

  const round = data?.round;

  const [
    { data: expensesCountQuery, fetching: fetchingExpensesCount },
  ] = useQuery({
    query: GET_EXPENSES_COUNT,
    variables: {
      roundId: round?.id,
    },
    pause: !round,
  });

  const handleSync = async () => {
    if (fetchingExpensesCount) {
      return toast.error(
        intl.formatMessage({ defaultMessage: "Expense count not available" })
      );
    }
    const requests = [];
    const expensesCount = expensesCountQuery.expensesCount.count || 1000;
    const BATCH_SIZE = 1000;
    for (let i = 0; i < expensesCount; i += BATCH_SIZE) {
      requests.push(
        syncOCExpenses({
          id: round.id,
          limit: BATCH_SIZE,
          offset: i,
        })
      );
    }
    await Promise.allSettled(requests);
    await removeDeletedOCExpenses({ id: round.id });
  };

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
              primary={
                <div>
                  <FormattedMessage defaultMessage="Opencollective Token" />
                </div>
              }
              secondary={
                round.ocTokenStatus !== TOKEN_STATUS.EMPTY ? (
                  HIDDEN_TEXT
                ) : (
                  <i>
                    <FormattedMessage defaultMessage="Not provided" />
                  </i>
                )
              }
              canEdit={true}
              isSet={round.ocTokenStatus !== TOKEN_STATUS.EMPTY}
              roundColor={round.color}
              openModal={() => setOpenModal("SET_OC_TOKEN")}
            />
          </List>
          <Divider />
          <List>
            <SettingsListItem
              primary={
                <div className="flex gap-3">
                  <FormattedMessage defaultMessage="Connect round to Open Collective" />
                  {round.ocVerified ? (
                    <span>
                      <VerifiedIcon className="h-6 w-6" />
                    </span>
                  ) : round?.ocCollective ? (
                    <span>
                      <Button
                        className="m-0 -mt-1"
                        size="small"
                        onClick={() => {
                          verifyOpencollective({
                            roundId: round.id,
                          }).then((r) => {
                            if (r?.data?.verifyOpencollective) {
                              toast.success(
                                intl.formatMessage({
                                  defaultMessage: "Verified",
                                })
                              );
                            } else {
                              toast.error(
                                intl.formatMessage({
                                  defaultMessage: "Could not verify",
                                })
                              );
                            }
                          });
                        }}
                      >
                        Verify
                      </Button>
                    </span>
                  ) : null}
                </div>
              }
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
                primary={
                  <div className="flex gap-2">
                    <span>
                      <FormattedMessage defaultMessage="Open Collective Webhook URL" />
                    </span>
                    {round?.ocWebhookUrl && (
                      <a
                        rel="noreferrer"
                        href={
                          round?.ocCollective?.parent
                            ? `https://opencollective.com/${round?.ocCollective?.parent?.slug}/${round?.ocCollective?.slug}/admin/webhooks`
                            : `https://opencollective.com/${round?.ocCollective?.slug}/admin/webhooks`
                        }
                        target="_blank"
                      >
                        <Button className="m-0 -mt-1" size="small">
                          <FormattedMessage defaultMessage="Create Webhook" />
                        </Button>
                      </a>
                    )}
                  </div>
                }
                secondary={
                  round.ocCollective ? (
                    <p className="w-4/5 overflow-hidden truncate whitespace-nowrap mt-1">
                      {round.ocWebhookUrl}
                    </p>
                  ) : (
                    <p className="italic mt-1">Connect to Open Collective</p>
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
          {round.ocVerified && (
            <>
              <Divider />
              <List>
                <ListItem>
                  <ListItemText
                    primary={
                      <FormattedMessage defaultMessage="Sync Open Collective Expenses" />
                    }
                    secondary={
                      fetchingExpensesCount ? (
                        <FormattedMessage defaultMessage="Fetching expense count..." />
                      ) : (
                        <FormattedMessage defaultMessage="Sync Open Collective expenses with cobudget" />
                      )
                    }
                  />
                  <ListItemSecondaryAction>
                    <Button
                      onClick={handleSync}
                      loading={syncing}
                      disabled={fetchingExpensesCount}
                    >
                      <FormattedMessage defaultMessage="Sync" />
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default Integrations;
