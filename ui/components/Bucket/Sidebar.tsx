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

const PUBLISH_BUCKET_MUTATION = gql`
  mutation PublishBucket($bucketId: ID!, $unpublish: Boolean) {
    publishBucket(bucketId: $bucketId, unpublish: $unpublish) {
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

const DELETE_BUCKET_MUTATION = gql`
  mutation DeleteBucket($bucketId: ID!) {
    deleteBucket(bucketId: $bucketId) {
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

const BucketSidebar = ({
  bucket,
  round,
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
  const [, publishBucket] = useMutation(PUBLISH_BUCKET_MUTATION);
  const [, markAsCompleted] = useMutation(MARK_AS_COMPLETED_MUTATION);
  const [, acceptFunding] = useMutation(ACCEPT_FUNDING_MUTATION);
  const [, deleteBucket] = useMutation(DELETE_BUCKET_MUTATION);

  const canApproveBucket =
    (!round.requireBucketApproval && canEdit) ||
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentCollMember?.isModerator;
  const isRoundAdminOrGuide =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentCollMember?.isModerator;
  const hasNotReachedMaxGoal =
    bucket.totalContributions < Math.max(bucket.minGoal, bucket.maxGoal);
  const hasReachedMinGoal = bucket.totalContributions > bucket.minGoal;

  const showFundButton =
    bucket.approved &&
    !bucket.funded &&
    !bucket.canceled &&
    hasNotReachedMaxGoal &&
    round.grantingIsOpen &&
    currentUser?.currentCollMember;
  const showAcceptFundingButton =
    bucket.approved &&
    !bucket.funded &&
    canEdit &&
    hasNotReachedMaxGoal &&
    hasReachedMinGoal;
  const showPublishButton = canEdit && !bucket.published;
  const showMarkAsCompletedButton =
    isRoundAdminOrGuide && bucket.funded && !bucket.completed;
  const showApproveButton =
    canApproveBucket && !round.grantingHasClosed && !bucket.approved;
  const showUnapproveButton =
    canApproveBucket && bucket.approved && !bucket.totalContributions;
  const showDeleteButton = canEdit && !bucket.totalContributions;
  const showCancelFundingButton = bucket.approved && !bucket.canceled && canEdit;

  return (
    <>
      {(bucket.minGoal || canEdit) && (
        <div className="bg-white rounded-lg shadow-md p-5 space-y-2">
          <GrantingStatus bucket={bucket} round={round} />
          {showFundButton && (
            <>
              <Button
                color={round.color}
                fullWidth
                onClick={() => setContributeModalOpen(true)}
              >
                Fund
              </Button>
              {showBucketReview ? (
                <Monster
                  round={round}
                  bucket={bucket}
                  currentOrg={currentOrg}
                />
              ) : null}
              {contributeModalOpen && (
                <ContributeModal
                  handleClose={() => setContributeModalOpen(false)}
                  bucket={bucket}
                  round={round}
                  currentUser={currentUser}
                />
              )}
            </>
          )}
          {showAcceptFundingButton && (
            <Button
              color={round.color}
              fullWidth
              onClick={() =>
                confirm(
                  `Are you sure you would like to accept and finalize funding for this bucket? This can't be undone.`
                ) &&
                acceptFunding({ bucketId: bucket.id }).catch((err) =>
                  alert(err.message)
                )
              }
            >
              Accept funding
            </Button>
          )}

          {showPublishButton && (
            <Button
              color={round.color}
              onClick={() =>
                publishBucket({
                  bucketId: bucket.id,
                  unpublish: bucket.published,
                })
              }
              fullWidth
            >
              Publish
            </Button>
          )}
          {showApproveButton && (
            <Button
              color={round.color}
              fullWidth
              onClick={() =>
                approveForGranting({
                  bucketId: bucket.id,
                  approved: true,
                }).catch((err) => alert(err.message))
              }
            >
              Open for funding
            </Button>
          )}
          {showMarkAsCompletedButton && (
            <Button
              color={round.color}
              fullWidth
              onClick={() =>
                confirm(
                  `Are you sure you would like to mark this bucket as completed? This can't be undone.`
                ) &&
                markAsCompleted({ bucketId: bucket.id }).then(
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
                {bucket.published && (
                  <button
                    className={css.dropdownButton}
                    onClick={() =>
                      publishBucket({
                        bucketId: bucket.id,
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
                      bucketId={bucket.id}
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
                        bucketId: bucket.id,
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
                      deleteBucket({ bucketId: bucket.id }).then(({ error }) => {
                        if (error) {
                          toast.error(error.message);
                        } else {
                          setActionsDropdownOpen(false);
                          Router.push(
                            "/[org]/[round]",
                            `/${currentOrg?.slug ?? "c"}/${round.slug}`
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
            {bucket.cocreators.map((member) => (
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
            cocreators={bucket.cocreators}
            round={round}
            bucket={bucket}
            currentUser={currentUser}
          />
        </div>
        <Tags
          currentOrg={currentOrg}
          bucket={bucket}
          round={round}
          canEdit={canEdit}
        />
      </div>
    </>
  );
};

export default BucketSidebar;
