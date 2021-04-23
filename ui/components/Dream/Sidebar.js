import { Tooltip } from "react-tippy";
import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import Router from "next/router";

import Dropdown from "components/Dropdown";
import { EditIcon, DotsHorizontalIcon } from "components/Icons";
import Avatar from "components/Avatar";
import IconButton from "components/IconButton";
import Button from "components/Button";

import ContributeModal from "./ContributeModal";
import EditCocreatorsModal from "./EditCocreatorsModal";
import GrantingStatus from "./GrantingStatus";

import { DREAMS_QUERY } from "pages/[event]";

const APPROVE_FOR_GRANTING_MUTATION = gql`
  mutation ApproveForGranting($dreamId: ID!, $approved: Boolean!) {
    approveForGranting(dreamId: $dreamId, approved: $approved) {
      id
      approved
      canceled
      canceledAt
    }
  }
`;

const PUBLISH_DREAM_MUTATION = gql`
  mutation PublishDream($dreamId: ID!, $unpublish: Boolean) {
    publishDream(dreamId: $dreamId, unpublish: $unpublish) {
      id
      published
    }
  }
`;

const MARK_AS_COMPLETED_MUTATION = gql`
  mutation MarkAsCompleted($dreamId: ID!) {
    markAsCompleted(dreamId: $dreamId) {
      id
      completedAt
      completed
    }
  }
`;

const ACCEPT_FUNDING_MUTATION = gql`
  mutation AcceptFunding($dreamId: ID!) {
    acceptFunding(dreamId: $dreamId) {
      id
      fundedAt
      funded
    }
  }
`;

const CANCEL_FUNDING_MUTATION = gql`
  mutation CancelFunding($dreamId: ID!) {
    cancelFunding(dreamId: $dreamId) {
      id
      fundedAt
      funded
      canceled
      canceledAt
      approved
      totalContributions
    }
  }
`;

const DELETE_DREAM_MUTATION = gql`
  mutation DeleteDream($dreamId: ID!) {
    deleteDream(dreamId: $dreamId) {
      id
    }
  }
`;

const css = {
  dropdownButton:
    "text-left block mx-2 px-2 py-1 mb-1 text-gray-800 last:text-red hover:bg-gray-200 rounded-lg focus:outline-none focus:bg-gray-200",
};

const DreamSidebar = ({ dream, event, currentOrgMember, canEdit }) => {
  const [approveForGranting] = useMutation(APPROVE_FOR_GRANTING_MUTATION);
  const [publishDream] = useMutation(PUBLISH_DREAM_MUTATION, {
    variables: { dreamId: dream.id },
  });
  const [markAsCompleted] = useMutation(MARK_AS_COMPLETED_MUTATION, {
    variables: { dreamId: dream.id },
  });
  const [acceptFunding] = useMutation(ACCEPT_FUNDING_MUTATION, {
    variables: { dreamId: dream.id },
  });
  const [cancelFunding] = useMutation(CANCEL_FUNDING_MUTATION, {
    variables: { dreamId: dream.id },
  });
  const [deleteDream] = useMutation(DELETE_DREAM_MUTATION, {
    variables: { dreamId: dream.id },
    refetchQueries: [
      {
        query: DREAMS_QUERY,
        variables: { eventSlug: event.slug },
      },
    ],
  });

  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [cocreatorModalOpen, setCocreatorModalOpen] = useState(false);
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);

  const isEventAdminOrGuide =
    currentOrgMember?.currentEventMembership?.isAdmin ||
    currentOrgMember?.currentEventMembership?.isGuide;
  const hasNotReachedMaxGoal =
    dream.totalContributions < Math.max(dream.minGoal, dream.maxGoal);
  const hasReachedMinGoal = dream.totalContributions > dream.minGoal;

  const showFundButton =
    dream.approved &&
    !dream.funded &&
    !dream.canceled &&
    hasNotReachedMaxGoal &&
    !!currentOrgMember?.currentEventMembership?.balance;
  const showAcceptFundingButton =
    dream.approved &&
    !dream.funded &&
    canEdit &&
    hasNotReachedMaxGoal &&
    hasReachedMinGoal;
  const showPublishButton = canEdit && !dream.published;
  const showMarkAsCompletedButton =
    isEventAdminOrGuide && dream.funded && !dream.completed;
  const showApproveButton =
    isEventAdminOrGuide && !event.grantingHasClosed && !dream.approved;
  const showUnapproveButton =
    isEventAdminOrGuide && dream.approved && !dream.totalContributions;
  const showDeleteButton = canEdit && !dream.totalContributions;
  const showCancelFundingButton = dream.approved && !dream.canceled && canEdit;

  return (
    <>
      {(dream.minGoal || canEdit) && (
        <div className="-mt-20 bg-white rounded-lg shadow-md p-5 space-y-2">
          <GrantingStatus dream={dream} event={event} />
          {showFundButton && (
            <>
              <Button
                color={event.color}
                fullWidth
                onClick={() => setContributeModalOpen(true)}
              >
                Fund
              </Button>
              {contributeModalOpen && (
                <ContributeModal
                  handleClose={() => setContributeModalOpen(false)}
                  dream={dream}
                  event={event}
                  currentOrgMember={currentOrgMember}
                />
              )}
            </>
          )}
          {showAcceptFundingButton && (
            <Button
              color={event.color}
              fullWidth
              onClick={() =>
                confirm(
                  "Are you sure you would like to accept and finalize funding for this dream? This can't be undone."
                ) && acceptFunding().catch((err) => alert(err.message))
              }
            >
              Accept funding
            </Button>
          )}

          {showPublishButton && (
            <Button
              color={event.color}
              onClick={() =>
                publishDream({
                  variables: { unpublish: dream.published },
                })
              }
              fullWidth
            >
              Publish
            </Button>
          )}
          {showApproveButton && (
            <Button
              color={event.color}
              fullWidth
              onClick={() =>
                approveForGranting({
                  variables: {
                    dreamId: dream.id,
                    approved: true,
                  },
                }).catch((err) => alert(err.message))
              }
            >
              Approve for granting
            </Button>
          )}
          {showMarkAsCompletedButton && (
            <Button
              color={event.color}
              fullWidth
              onClick={() =>
                confirm(
                  "Are you sure you would like to mark this dream as completed? This can't be undone."
                ) && markAsCompleted().catch((err) => alert(err.message))
              }
            >
              Mark as completed
            </Button>
          )}
          {canEdit && (
            <div className="relative">
              <div className="flex justify-end">
                <Tooltip title="More actions" position="bottom" size="small">
                  <IconButton onClick={() => setActionsDropdownOpen(true)}>
                    <DotsHorizontalIcon />
                  </IconButton>
                </Tooltip>
              </div>

              <Dropdown
                open={actionsDropdownOpen}
                handleClose={() => setActionsDropdownOpen(false)}
              >
                {dream.published && (
                  <button
                    className={css.dropdownButton}
                    onClick={() =>
                      publishDream({
                        variables: { unpublish: true },
                      }).then(() => setActionsDropdownOpen(false))
                    }
                  >
                    Unpublish
                  </button>
                )}
                {showCancelFundingButton && (
                  <button
                    className={css.dropdownButton}
                    onClick={() =>
                      confirm(
                        "Are you sure you would like to cancel funding? This is irreversible and will return all contributions to those that have contributed."
                      ) &&
                      cancelFunding()
                        .then(() => setActionsDropdownOpen(false))
                        .catch((err) => alert(err.message))
                    }
                  >
                    Cancel funding
                  </button>
                )}
                {showUnapproveButton && (
                  <button
                    className={css.dropdownButton}
                    onClick={() =>
                      approveForGranting({
                        variables: {
                          dreamId: dream.id,
                          approved: false,
                        },
                      })
                        .then(() => setActionsDropdownOpen(false))
                        .catch((err) => alert(err.message))
                    }
                  >
                    Unapprove for granting
                  </button>
                )}
                {showDeleteButton && (
                  <button
                    className={css.dropdownButton}
                    onClick={() =>
                      confirm(
                        "Are you sure you would like to delete this dream?"
                      ) &&
                      deleteDream()
                        .then(() => {
                          setActionsDropdownOpen(false);
                          Router.push("/[event]", `/${event.slug}`);
                        })
                        .catch((err) => alert(err.message))
                    }
                  >
                    Delete
                  </button>
                )}
              </Dropdown>
            </div>
          )}
        </div>
      )}

      <div className="mt-5">
        <h2 className="mb-2 font-medium hidden md:block relative">
          <span className="mr-2">Co-creators</span>
          {canEdit && (
            <div className="absolute top-0 right-0">
              <Tooltip title="Edit co-creators" position="bottom" size="small">
                <IconButton onClick={() => setCocreatorModalOpen(true)}>
                  <EditIcon className="h-5 w-5" />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </h2>

        <div className="flex items-center flex-wrap">
          {dream.cocreators.map((member) => (
            // <Tooltip key={member.user.id} title={member.user.name}>
            <div
              key={member.orgMember.user.id}
              className="flex items-center mr-2 md:mr-3 sm:mb-2"
            >
              <Avatar user={member.orgMember.user} />{" "}
              <span className="ml-2 text-gray-700 hidden md:block">
                {member.orgMember.user.username}
              </span>
            </div>
            // </Tooltip>
          ))}
          <div className="block md:hidden">
            {canEdit && (
              <IconButton onClick={() => setCocreatorModalOpen(true)}>
                <EditIcon className="h-5 w-5" />
              </IconButton>
            )}
          </div>
        </div>
        <EditCocreatorsModal
          open={cocreatorModalOpen}
          handleClose={() => setCocreatorModalOpen(false)}
          cocreators={dream.cocreators}
          event={event}
          dream={dream}
          currentOrgMember={currentOrgMember}
        />
      </div>
    </>
  );
};

export default DreamSidebar;
