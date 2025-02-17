import { Modal } from "@material-ui/core";
import Tooltip from "@tippyjs/react";
import Router from "next/router";
import { useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { gql, useMutation } from "urql";

import Avatar from "../Avatar";
import Button from "../Button";
import Dropdown from "../Dropdown";
import IconButton from "../IconButton";
import { DotsHorizontalIcon, EditIcon, Star } from "../Icons";

import ContributeModal from "./ContributeModal";
import EditCocreatorsModal from "./EditCocreatorsModal";
import GrantingStatus from "./GrantingStatus";

import Monster from "components/Monster";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import capitalize from "utils/capitalize";
import getStatusColor from "utils/getStatusColor";
import Label from "../../components/Label";
import isRtl from "../../utils/isRTL";
import Infobox from "./Infobox";
import Tags from "./Tags";

const APPROVE_FOR_GRANTING_MUTATION = gql`
  mutation ApproveForGranting($bucketId: ID!, $approved: Boolean!) {
    approveForGranting(bucketId: $bucketId, approved: $approved) {
      id
      approved
      canceled
      canceledAt
      status
    }
  }
`;

const PUBLISH_BUCKET_MUTATION = gql`
  mutation PublishBucket($bucketId: ID!, $unpublish: Boolean) {
    publishBucket(bucketId: $bucketId, unpublish: $unpublish) {
      id
      fundedAt
      published
      status
    }
  }
`;
const PIN_BUCKET_MUTATION = gql`
  mutation PinBucket($bucketId: ID!, $pin: Boolean!) {
    pinBucket(bucketId: $bucketId, pin: $pin) {
      id
      pinnedAt
    }
  }
`;

const MARK_AS_COMPLETED_MUTATION = gql`
  mutation MarkAsCompleted($bucketId: ID!) {
    markAsCompleted(bucketId: $bucketId) {
      id
      fundedAt
      completedAt
      completed
      status
    }
  }
`;

const ACCEPT_FUNDING_MUTATION = gql`
  mutation AcceptFunding($bucketId: ID!) {
    acceptFunding(bucketId: $bucketId) {
      id
      fundedAt
      funded
      status
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
      status
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

const SET_READY_FOR_FUNDING = gql`
  mutation SetReadyForFunding($bucketId: ID!, $isReadyForFunding: Boolean!) {
    setReadyForFunding(
      bucketId: $bucketId
      isReadyForFunding: $isReadyForFunding
    ) {
      id
      readyForFunding
      status
    }
  }
`;

const REOPEN_FUNDING = gql`
  mutation ReopenFunding($bucketId: ID!) {
    reopenFunding(bucketId: $bucketId) {
      id
      funded
      status
    }
  }
`;

const TOGGLE_FAVORITE_BUCKET = gql`
  mutation ToggleFavoriteBucket($bucketId: ID!) {
    toggleFavoriteBucket(bucketId: $bucketId) {
      id
      isFavorite
    }
  }
`;

const ConfirmCancelBucket = ({ open, close, bucketId }) => {
  const [{ fetching }, cancelFunding] = useMutation(CANCEL_FUNDING_MUTATION);

  return (
    <Modal open={open} className="flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-sm">
        <div className="font-bold text-lg mb-2">
          <FormattedMessage
            defaultMessage="Are you sure you want to cancel this {bucketName}?"
            values={{
              bucketName: process.env.BUCKET_NAME_SINGULAR,
            }}
          />
        </div>
        <div className="mb-2">
          <FormattedMessage
            defaultMessage="If you confirm, the money that has already been given to this {bucketName} will be returned to its funders."
            values={{
              bucketName: process.env.BUCKET_NAME_SINGULAR,
            }}
          />
        </div>
        <div className="font-bold">
          <FormattedMessage defaultMessage="Caution: This cannot be undone" />
        </div>
        <div className="mt-4 flex justify-end items-center">
          <div className="flex">
            <Button
              color="white"
              variant="secondary"
              onClick={() => close()}
              disabled={fetching}
            >
              <FormattedMessage defaultMessage="Cancel" />
            </Button>
            <Button
              color="red"
              loading={fetching}
              testid="confirm-cancel-bucket-button"
              onClick={() =>
                cancelFunding({ bucketId }).then(({ error }) => {
                  if (error) alert(error.message);

                  close();
                })
              }
            >
              <FormattedMessage defaultMessage="Yes, cancel it" />
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
  currentUser,
  currentGroup,
  canEdit,
  showBucketReview,
  isAdminOrModerator,
  isCocreator,
}) => {
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [cocreatorModalOpen, setCocreatorModalOpen] = useState(false);
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const [confirmCancelBucketOpen, setConfirmCancelBucketOpen] = useState(false);

  const [, approveForGranting] = useMutation(APPROVE_FOR_GRANTING_MUTATION);
  const [, readyForFunding] = useMutation(SET_READY_FOR_FUNDING);
  const [, publishBucket] = useMutation(PUBLISH_BUCKET_MUTATION);
  const [, markAsCompleted] = useMutation(MARK_AS_COMPLETED_MUTATION);
  const [, acceptFunding] = useMutation(ACCEPT_FUNDING_MUTATION);
  const [, deleteBucket] = useMutation(DELETE_BUCKET_MUTATION);
  const [, reopenFunding] = useMutation(REOPEN_FUNDING);
  const [{ fetching: togglingFavorite }, toggleFavorite] = useMutation(
    TOGGLE_FAVORITE_BUCKET
  );
  const [, pinBucket] = useMutation(PIN_BUCKET_MUTATION);

  const intl = useIntl();

  const statusList = {
    PENDING_APPROVAL: intl.formatMessage({
      defaultMessage: "Draft",
    }),
    IDEA: intl.formatMessage({
      defaultMessage: "Idea",
    }),
    OPEN_FOR_FUNDING: intl.formatMessage({ defaultMessage: "Funding" }),
    FUNDED: intl.formatMessage({ defaultMessage: "Funded" }),
    PARTIAL_FUNDING: intl.formatMessage({ defaultMessage: "Partially funded" }),
    CANCELED: intl.formatMessage({ defaultMessage: "Canceled" }),
    COMPLETED: intl.formatMessage({ defaultMessage: "Completed" }),
    ARCHIVED: intl.formatMessage({ defaultMessage: "Archived" }),
  };

  const canApproveBucket =
    (!bucket.round.canCocreatorStartFunding && canEdit) ||
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentCollMember?.isModerator ||
    (isCocreator && bucket.round.canCocreatorStartFunding);

  const isRoundAdminOrGuide =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentCollMember?.isModerator;
  const hasNotReachedMaxGoal =
    bucket.totalContributions < Math.max(bucket.minGoal, bucket.maxGoal);
  const hasReachedMinGoal = bucket.totalContributions >= bucket.minGoal;

  const showFundButton =
    bucket.approved &&
    !bucket.funded &&
    !bucket.canceled &&
    hasNotReachedMaxGoal &&
    bucket.round.grantingIsOpen &&
    currentUser?.currentCollMember;
  const showAcceptFundingButton =
    bucket.approved && !bucket.funded && canEdit && hasReachedMinGoal;
  const showPublishButton = canEdit && !bucket.published;
  const showMarkAsCompletedButton =
    bucket.funded && !bucket.completed && isCocreator;
  const showReopenFundingButton =
    bucket.funded &&
    !bucket.completed &&
    isAdminOrModerator &&
    hasReachedMinGoal &&
    hasNotReachedMaxGoal;
  const showApproveButton =
    canApproveBucket &&
    !bucket.round.grantingHasClosed &&
    !bucket.approved &&
    bucket.status === "IDEA" &&
    (isAdminOrModerator ||
      (isCocreator && bucket.round.canCocreatorStartFunding));

  const showUnapproveButton =
    canApproveBucket && bucket.approved && !bucket.totalContributions;
  const showDeleteButton = canEdit && !bucket.totalContributions;
  const showCancelFundingButton =
    bucket.approved && !bucket.canceled && canEdit && !bucket.completed;
  //show ready for funding button only to co-creators when the bucket is in IDEA stage
  const showReadyForFundingButton =
    bucket.status === "IDEA" &&
    isCocreator &&
    !isAdminOrModerator &&
    !bucket.round.canCocreatorStartFunding;

  const buttons = useMemo(() => {
    return {
      ACCEPT_FUNDING: () => (
        <Button
          color={bucket.round.color}
          fullWidth
          onClick={() =>
            confirm(
              intl.formatMessage(
                {
                  defaultMessage: `Are you sure you want to accept the funding, even if you have not reached your max goal? You will need to contact an admin to open the {bucketName} for funding again.`,
                },
                { bucketName: process.env.BUCKET_NAME_SINGULAR }
              )
            ) &&
            acceptFunding({ bucketId: bucket.id }).catch((err) =>
              alert(err.message)
            )
          }
          testid="accept-funding-button"
        >
          <FormattedMessage defaultMessage="Accept funding" />
        </Button>
      ),
      PUBLISH_BUTTON: () => (
        <Button
          color={bucket.round.color}
          onClick={() =>
            publishBucket({
              bucketId: bucket.id,
              unpublish: bucket.published,
            })
          }
          fullWidth
          testid="publish-bucket"
        >
          <FormattedMessage defaultMessage="Publish" />
        </Button>
      ),
      APPROVE_BUTTON: () => (
        <Button
          color={bucket.round.color}
          fullWidth
          onClick={() =>
            approveForGranting({
              bucketId: bucket.id,
              approved: true,
            }).catch((err) => alert(err.message))
          }
          testid="open-for-funding-button"
        >
          <FormattedMessage defaultMessage="Open for funding" />
        </Button>
      ),
      MARK_AS_COMPLETED: () => (
        <Button
          color={bucket.round.color}
          fullWidth
          onClick={() =>
            confirm(
              intl.formatMessage(
                {
                  defaultMessage: `Are you sure you would like to mark this {bucketName} as completed? This can't be undone.`,
                },
                { bucketName: process.env.BUCKET_NAME_SINGULAR }
              )
            ) &&
            markAsCompleted({ bucketId: bucket.id }).then(({ data, error }) => {
              if (error) toast.error(error.message);
            })
          }
          testid="mark-as-completed-button"
        >
          <FormattedMessage defaultMessage="Mark as completed" />
        </Button>
      ),
      READY_FOR_FUNDING: () => (
        <Button
          color={bucket.round.color}
          fullWidth
          onClick={() =>
            readyForFunding({
              bucketId: bucket.id,
              isReadyForFunding: !bucket.readyForFunding,
            }).then(({ data, error }) => {
              if (error) toast.error(error.message);
            })
          }
          testid="mark-as-completed-button"
        >
          {bucket.readyForFunding ? (
            <FormattedMessage defaultMessage="Mark as not ready" />
          ) : (
            <FormattedMessage defaultMessage="Ready for funding" />
          )}
        </Button>
      ),
      REOPEN_FUNDING: () => (
        <Button
          color={bucket.round.color}
          fullWidth
          onClick={() =>
            reopenFunding({ bucketId: bucket.id }).then(({ data, error }) => {
              if (error) toast.error(error.message);
            })
          }
          testid="mark-as-completed-button"
        >
          <FormattedMessage defaultMessage="Re-open for funding" />
        </Button>
      ),
    };
  }, [
    bucket,
    acceptFunding,
    approveForGranting,
    intl,
    markAsCompleted,
    readyForFunding,
    reopenFunding,
    publishBucket,
  ]);

  const showDropdown = useMemo(() => {
    return (
      showCancelFundingButton ||
      showUnapproveButton ||
      showDeleteButton ||
      bucket.published
    );
  }, [showCancelFundingButton, showUnapproveButton, showDeleteButton, bucket]);

  return (
    <>
      {(bucket.minGoal || canEdit) && (
        <div className="bg-white rounded-lg shadow-md p-5 space-y-2">
          <GrantingStatus bucket={bucket} />
          {showFundButton && (
            <>
              <Button
                color={bucket.round.color}
                fullWidth
                onClick={() => {
                  if (bucket.round?.bucketsLimit?.isLimitOver) {
                    const event = new CustomEvent(
                      "show-bucket-limit-over-popup",
                      { detail: { isAdmin: isAdminOrModerator } }
                    );
                    window.dispatchEvent(event);
                    return;
                  }
                  if (
                    bucket?.round?.group?.subscriptionStatus?.isActive === false
                  ) {
                    const event = new CustomEvent(
                      "show-upgrade-group-message",
                      { detail: { groupId: bucket?.round?.group?.id } }
                    );
                    window.dispatchEvent(event);
                    return;
                  }
                  setContributeModalOpen(true);
                }}
              >
                <FormattedMessage defaultMessage="Fund" />
              </Button>

              {contributeModalOpen && (
                <ContributeModal
                  handleClose={() => setContributeModalOpen(false)}
                  bucket={bucket}
                  currentUser={currentUser}
                  currentGroup={currentGroup}
                />
              )}
            </>
          )}
          {showBucketReview ? <Monster bucket={bucket} /> : null}
          {showAcceptFundingButton && <buttons.ACCEPT_FUNDING />}
          {showPublishButton && <buttons.PUBLISH_BUTTON />}
          {showApproveButton && <buttons.APPROVE_BUTTON />}
          {showMarkAsCompletedButton && <buttons.MARK_AS_COMPLETED />}
          {showReadyForFundingButton && <buttons.READY_FOR_FUNDING />}
          {showReopenFundingButton && <buttons.REOPEN_FUNDING />}
          {canEdit && showDropdown && (
            <div className="relative">
              <div className="flex justify-end">
                <Tooltip
                  content={intl.formatMessage({
                    defaultMessage: "More actions",
                  })}
                  placement="bottom"
                  arrow={false}
                >
                  <IconButton onClick={() => setActionsDropdownOpen(true)}>
                    <span data-testid="bucket-more-edit-options-button">
                      <DotsHorizontalIcon />
                    </span>
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
                    <FormattedMessage defaultMessage="Unpublish" />
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
                      data-testid="cancel-bucket-button"
                    >
                      <FormattedMessage defaultMessage="Cancel" />{" "}
                      {process.env.BUCKET_NAME_SINGULAR}
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
                    <FormattedMessage defaultMessage="Unapprove for funding" />
                  </button>
                )}
{isAdminOrModerator && (
  <>
    {bucket.pinnedAt ? (
      <button
        className={css.dropdownButton}
        onClick={() =>
          pinBucket({ bucketId: bucket.id, pin: false }).then(({ error }) => {
            if (error) {
              toast.error(error.message);
            } else {
              toast.success("Bucket unpinned");
              setActionsDropdownOpen(false);
            }
          })
        }
      >
        Unpin
      </button>
    ) : (
      <button
        className={css.dropdownButton}
        onClick={() =>
          pinBucket({ bucketId: bucket.id, pin: true }).then(({ error }) => {
            if (error) {
              toast.error(error.message);
            } else {
              toast.success("Bucket pinned");
              setActionsDropdownOpen(false);
            }
          })
        }
      >
        Pin
      </button>
    )}
  </>
)}
{showDeleteButton && (
  <button
    className={css.dropdownButton}
    onClick={() =>
      confirm(
        intl.formatMessage(
          {
            defaultMessage: "Are you sure you would like to delete this {bucketName}?",
          },
          { bucketName: process.env.BUCKET_NAME_SINGULAR }
        )
      ) &&
      deleteBucket({ bucketId: bucket.id }).then(({ error }) => {
        if (error) {
          toast.error(error.message);
        } else {
          setActionsDropdownOpen(false);
          Router.push(
            "/[group]/[round]",
            `/${bucket.round.group?.slug ?? "c"}/${bucket.round.slug}`
          );
          toast.success(
            `${capitalize(process.env.BUCKET_NAME_SINGULAR)} ${intl.formatMessage({
              defaultMessage: "deleted",
            })}`
          );
        }
      })
    }
  >
    <FormattedMessage defaultMessage="Delete" />
  </button>
)}
                {showDeleteButton && (
                  <button
                    className={css.dropdownButton}
                    onClick={() =>
                      confirm(
                        intl.formatMessage(
                          {
                            defaultMessage: `Are you sure you would like to delete this {bucketName}?`,
                          },
                          { bucketName: process.env.BUCKET_NAME_SINGULAR }
                        )
                      ) &&
                      deleteBucket({ bucketId: bucket.id }).then(
                        ({ error }) => {
                          if (error) {
                            toast.error(error.message);
                          } else {
                            setActionsDropdownOpen(false);
                            Router.push(
                              "/[group]/[round]",
                              `/${bucket.round.group?.slug ?? "c"}/${
                                bucket.round.slug
                              }`
                            );
                            toast.success(
                              `${capitalize(
                                process.env.BUCKET_NAME_SINGULAR
                              )} ${intl.formatMessage({
                                defaultMessage: "deleted",
                              })}`
                            );
                          }
                        }
                      )
                    }
                  >
                    <FormattedMessage defaultMessage="Delete" />
                  </button>
                )}
              </Dropdown>
            </div>
          )}
        </div>
      )}
      <div className="mt-5 space-y-5">
        <div className="grid grid-cols-6">
          <div className="col-span-5">
            <div className="mr-2 font-medium ">
              <FormattedMessage defaultMessage="Bucket Status" />
            </div>
            <span>
              <Label
                className={
                  "mt-2 inline-block " + getStatusColor(bucket.status, bucket)
                }
                testid="bucket-status-view"
              >
                {statusList[bucket.status]}
              </Label>
            </span>
          </div>
          <div className="flex items-center justify-end">
            <span
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite({ bucketId: bucket.id }).then(({ error }) => {
                  if (error?.graphQLErrors?.length > 0) {
                    return toast.error(error.graphQLErrors[0].message);
                  }
                  if (bucket.isFavorite) {
                    toast.success(
                      intl.formatMessage({
                        defaultMessage: "Bucket removed from favorites",
                      })
                    );
                  } else {
                    toast.success(
                      intl.formatMessage({
                        defaultMessage: "Bucket added to favorites",
                      })
                    );
                  }
                });
              }}
              className="cursor-pointer"
            >
              {bucket.isFavorite ? (
                <Star
                  height={"40"}
                  width={"40"}
                  fillColor={"#333"}
                  lineColor={"#333333"}
                />
              ) : (
                <Star
                  height={"40"}
                  width={"40"}
                  fillColor={"transparent"}
                  lineColor={"#333333"}
                />
              )}
            </span>
          </div>
        </div>
        <div className="">
          <h2 className="mb-2 font-medium hidden md:block relative">
            <span className="mr-2 font-medium ">
              <FormattedMessage defaultMessage="Co-creators" />
            </span>
            {canEdit && (
              <div
                className={
                  "absolute top-0 " +
                  (isRtl(intl.locale) ? "left-0" : "right-0")
                }
              >
                <Tooltip
                  content={intl.formatMessage({
                    defaultMessage: "Edit co-creators",
                  })}
                  placement="bottom"
                  arrow={false}
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
                className="flex items-center mr-2 md:mr-3 sm:mb-2 space-x-2"
              >
                <Avatar user={member.user} />{" "}
                <span
                  className={
                    "items-center space-x-1 hidden md:block " +
                    (isRtl(intl.locale) ? "space-x-reverse" : "")
                  }
                >
                  <span className="font-medium text-gray-900">
                    {member.user.name}
                  </span>
                  {member.user.username && (
                    <span className="text-gray-600 font-normal">
                      @{member.user.username}
                    </span>
                  )}
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
            bucket={bucket}
            currentUser={currentUser}
          />
        </div>
        <Tags bucket={bucket} canEdit={canEdit} />

        <Infobox
          bucket={bucket}
          isAdminOrModerator={isAdminOrModerator}
          isCocreator={isCocreator}
        />

        <p className="italic text-gray-600 text-sm">
          <FormattedMessage
            defaultMessage="The bucket was created on {date}"
            values={{ date: dayjs(bucket.createdAt).format("MMMM DD, YYYY") }}
          />
        </p>
      </div>
    </>
  );
};

export default BucketSidebar;
