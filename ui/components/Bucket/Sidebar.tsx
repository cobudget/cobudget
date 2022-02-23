import { Tooltip } from "react-tippy";
import { useState } from "react";
import { useMutation, gql } from "urql";
import Router from "next/router";
import { Modal } from "@material-ui/core";

import Dropdown from "../Dropdown";
import { EditIcon, DotsHorizontalIcon } from "../Icons";
import Avatar from "../Avatar";
import IconButton from "../IconButton";
import Button from "../Button";

import ContributeModal from "./ContributeModal";
import EditCocreatorsModal from "./EditCocreatorsModal";
import GrantingStatus from "./GrantingStatus";

import Tags from "./Tags";
import toast from "react-hot-toast";
import Monster from "components/Monster";

const APPROVE_FOR_GRANTING_MUTATION = gql`
  mutation ApproveForGranting($bucketId: ID!, $approved: Boolean!) {
    approveForGranting(bucketId: $bucketId, approved: $approved) {
      id
      approved
      canceled
      canceledAt
    }
  }
`;

const PUBLISH_DREAM_MUTATION = gql`
  mutation PublishDream($bucketId: ID!, $unpublish: Boolean) {
    publishDream(bucketId: $bucketId, unpublish: $unpublish) {
      id
      published
    }
  }
`;

const MARK_AS_COMPLETED_MUTATION = gql`
  mutation MarkAsCompleted($bucketId: ID!) {
    markAsCompleted(bucketId: $bucketId) {
      id
      completedAt
      completed
    }
  }
`;

const ACCEPT_FUNDING_MUTATION = gql`
  mutation AcceptFunding($bucketId: ID!) {
    acceptFunding(bucketId: $bucketId) {
      id
      fundedAt
      funded
    }
  }
`;

const CANCEL_FUNDING_MUTATION = gql`
  mutation CancelFunding($bucketId: ID!) {
    cancelFunding(bucketId: $bucketId) {
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
  mutation DeleteDream($bucketId: ID!) {
    deleteDream(bucketId: $bucketId) {
      id
    }
  }
`;

const ConfirmCancelBucket = ({ open, close, bucketId }) => {
  const [{ fetching }, cancelFunding] = useMutation(CANCEL_FUNDING_MUTATION);

  return (
    <Modal open={open} className="flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-sm">
        <div className="font-bold text-lg mb-2">
          Are you sure you want to cancel this bucket?
        </div>
        <div className="mb-2">
          If you confirm, the money that has already been given to this bucket
          will be returned to its funders.
        </div>
        <div className="font-bold">Caution: This cannot be undone</div>
        <div className="mt-4 flex justify-end items-center">
          <div className="flex">
            <Button
              color="white"
              variant="secondary"
              onClick={() => close()}
              disabled={fetching}
            >
              Cancel
            </Button>
            <Button
              color="red"
              loading={fetching}
              onClick={() =>
                cancelFunding({ bucketId }).then(({ error }) => {
                  if (error) alert(error.message);

                  close();
                })
              }
            >
              Yes, cancel it
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const css = {
  dropdownButton:
    "text-left block mx-2 px-2 py-1 mb-1 text-gray-800 last:text-red hover:bg-gray-200 rounded-lg focus:outline-none focus:bg-gray-200",
};

const DreamSidebar = ({
  dream,
  collection,
  currentUser,
  canEdit,
  currentOrg,
  showBucketReview,
}) => {
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [cocreatorModalOpen, setCocreatorModalOpen] = useState(false);
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const [confirmCancelBucketOpen, setConfirmCancelBucketOpen] = useState(false);

  const [, approveForGranting] = useMutation(APPROVE_FOR_GRANTING_MUTATION);
  const [, publishDream] = useMutation(PUBLISH_DREAM_MUTATION);
  const [, markAsCompleted] = useMutation(MARK_AS_COMPLETED_MUTATION);
  const [, acceptFunding] = useMutation(ACCEPT_FUNDING_MUTATION);
  const [, deleteDream] = useMutation(DELETE_DREAM_MUTATION);

  const canApproveBucket =
    (!collection.requireBucketApproval && canEdit) ||
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentCollMember?.isModerator;
  const isEventAdminOrGuide =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentCollMember?.isModerator;
  const hasNotReachedMaxGoal =
    dream.totalContributions < Math.max(dream.minGoal, dream.maxGoal);
  const hasReachedMinGoal = dream.totalContributions > dream.minGoal;

  const showFundButton =
    dream.approved &&
    !dream.funded &&
    !dream.canceled &&
    hasNotReachedMaxGoal &&
    collection.grantingIsOpen &&
    currentUser?.currentCollMember;
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
    canApproveBucket && !collection.grantingHasClosed && !dream.approved;
  const showUnapproveButton =
    canApproveBucket && dream.approved && !dream.totalContributions;
  const showDeleteButton = canEdit && !dream.totalContributions;
  const showCancelFundingButton = dream.approved && !dream.canceled && canEdit;

  return (
    <>
      {(dream.minGoal || canEdit) && (
        <div className="bg-white rounded-lg shadow-md p-5 space-y-2">
          <GrantingStatus dream={dream} collection={collection} />
          {showFundButton && (
            <>
              <Button
                color={collection.color}
                fullWidth
                onClick={() => setContributeModalOpen(true)}
              >
                Fund
              </Button>
              {showBucketReview ? (
                <Monster
                  event={collection}
                  bucket={dream}
                  currentOrg={currentOrg}
                />
              ) : null}
              {contributeModalOpen && (
                <ContributeModal
                  handleClose={() => setContributeModalOpen(false)}
                  dream={dream}
                  collection={collection}
                  currentUser={currentUser}
                />
              )}
            </>
          )}
          {showAcceptFundingButton && (
            <Button
              color={collection.color}
              fullWidth
              onClick={() =>
                confirm(
                  `Are you sure you would like to accept and finalize funding for this bucket? This can't be undone.`
                ) &&
                acceptFunding({ bucketId: dream.id }).catch((err) =>
                  alert(err.message)
                )
              }
            >
              Accept funding
            </Button>
          )}

          {showPublishButton && (
            <Button
              color={collection.color}
              onClick={() =>
                publishDream({
                  bucketId: dream.id,
                  unpublish: dream.published,
                })
              }
              fullWidth
            >
              Publish
            </Button>
          )}
          {showApproveButton && (
            <Button
              color={collection.color}
              fullWidth
              onClick={() =>
                approveForGranting({
                  bucketId: dream.id,
                  approved: true,
                }).catch((err) => alert(err.message))
              }
            >
              Open for funding
            </Button>
          )}
          {showMarkAsCompletedButton && (
            <Button
              color={collection.color}
              fullWidth
              onClick={() =>
                confirm(
                  `Are you sure you would like to mark this bucket as completed? This can't be undone.`
                ) &&
                markAsCompleted({ bucketId: dream.id }).then(
                  ({ data, error }) => {
                    if (error) toast.error(error.message);
                  }
                )
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
                        bucketId: dream.id,
                        unpublish: true,
                      }).then(() => setActionsDropdownOpen(false))
                    }
                  >
                    Unpublish
                  </button>
                )}
                {showCancelFundingButton && (
                  <>
                    <ConfirmCancelBucket
                      open={confirmCancelBucketOpen}
                      close={() => {
                        setConfirmCancelBucketOpen(false);
                        setActionsDropdownOpen(false);
                      }}
                      bucketId={dream.id}
                    />
                    <button
                      className={css.dropdownButton}
                      onClick={() => setConfirmCancelBucketOpen(true)}
                    >
                      Cancel bucket
                    </button>
                  </>
                )}
                {showUnapproveButton && (
                  <button
                    className={css.dropdownButton}
                    onClick={() =>
                      approveForGranting({
                        bucketId: dream.id,
                        approved: false,
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
                        `Are you sure you would like to delete this bucket?`
                      ) &&
                      deleteDream({ bucketId: dream.id }).then(({ error }) => {
                        if (error) {
                          toast.error(error.message);
                        } else {
                          setActionsDropdownOpen(false);
                          Router.push(
                            "/[org]/[collection]",
                            `/${currentOrg?.slug ?? "c"}/${collection.slug}`
                          );
                          toast.success("Bucket deleted");
                        }
                      })
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
      <div className="mt-5 space-y-5">
        <div className="">
          <h2 className="mb-2 font-medium hidden md:block relative">
            <span className="mr-2 font-medium ">Co-creators</span>
            {canEdit && (
              <div className="absolute top-0 right-0">
                <Tooltip
                  title="Edit co-creators"
                  position="bottom"
                  size="small"
                >
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
                key={member.user.id}
                className="flex items-center mr-2 md:mr-3 sm:mb-2"
              >
                <Avatar user={member.user} />{" "}
                <span className="ml-2 text-gray-700 hidden md:block">
                  {member.user.username}
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
            collection={collection}
            dream={dream}
            currentUser={currentUser}
          />
        </div>
        <Tags
          currentOrg={currentOrg}
          dream={dream}
          collection={collection}
          canEdit={canEdit}
        />
      </div>
    </>
  );
};

export default DreamSidebar;
