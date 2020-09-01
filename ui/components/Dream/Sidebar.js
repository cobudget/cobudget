import { Button } from "@material-ui/core";
import { Tooltip } from "react-tippy";
import gql from "graphql-tag";
import { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import Router from "next/router";

import Dropdown from "components/Dropdown";
import { EditIcon, DotsHorizontalIcon } from "components/Icons";
import Avatar from "components/Avatar";
import IconButton from "components/IconButton";

import GiveGrantlingsModal from "./GiveGrantlingsModal";
import PreOrPostFundModal from "./PreOrPostFundModal";
import EditCocreatorsModal from "./EditCocreatorsModal";
import GrantingStatus from "./GrantingStatus";

import { DREAMS_QUERY } from "pages/[event]";

const APPROVE_FOR_GRANTING_MUTATION = gql`
  mutation ApproveForGranting($dreamId: ID!, $approved: Boolean!) {
    approveForGranting(dreamId: $dreamId, approved: $approved) {
      id
      approved
    }
  }
`;

const RECLAIM_GRANTS_MUTATION = gql`
  mutation ReclaimGrants($dreamId: ID!) {
    reclaimGrants(dreamId: $dreamId) {
      id
      currentNumberOfGrants
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

export default ({ dream, event, currentUser, canEdit }) => {
  const [approveForGranting] = useMutation(APPROVE_FOR_GRANTING_MUTATION);
  const [reclaimGrants] = useMutation(RECLAIM_GRANTS_MUTATION);
  const [publishDream] = useMutation(PUBLISH_DREAM_MUTATION, {
    variables: { dreamId: dream.id },
  });

  const [deleteDream] = useMutation(DELETE_DREAM_MUTATION, {
    variables: { dreamId: dream.id },
    refetchQueries: [
      {
        query: DREAMS_QUERY,
        variables: { eventId: event.id },
      },
    ],
  });

  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [prePostFundModalOpen, setPrePostFundModalOpen] = useState(false);
  const [cocreatorModalOpen, setCocreatorModalOpen] = useState(false);
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);

  return (
    <>
      {(dream.approved || canEdit) && (
        <div className="-mt-20 bg-white rounded-lg shadow-md p-5">
          {dream.approved && (
            <>
              <GrantingStatus dream={dream} />
              {currentUser?.membership?.availableGrants > 0 && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    onClick={() => setGrantModalOpen(true)}
                  >
                    Donate to dream
                  </Button>
                  <GiveGrantlingsModal
                    open={grantModalOpen}
                    handleClose={() => setGrantModalOpen(false)}
                    dream={dream}
                    event={event}
                    currentUser={currentUser}
                  />
                </>
              )}
            </>
          )}
          {canEdit && (
            <>
              {!dream.published && (
                <Button
                  color="primary"
                  variant="contained"
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
            </>
          )}
          {(currentUser?.membership?.isAdmin ||
            currentUser?.membership?.isGuide) && (
            <div>
              <div className="my-2">
                {!event.grantingHasClosed && !dream.approved && (
                  <Button
                    color="primary"
                    variant="contained"
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
              </div>

              {currentUser?.membership?.isAdmin && (
                <>
                  <div className="my-2">
                    {event.grantingHasClosed &&
                      dream.currentNumberOfGrants > 0 &&
                      dream.currentNumberOfGrants < dream.minGoalGrants && (
                        <>
                          <Button
                            onClick={() =>
                              reclaimGrants({
                                variables: { dreamId: dream.id },
                              }).catch((err) => alert(err.message))
                            }
                          >
                            Reclaim grants
                          </Button>
                          <br />
                        </>
                      )}
                  </div>
                </>
              )}
            </div>
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
                {dream.approved &&
                  !event.grantingHasClosed &&
                  (currentUser?.membership?.isAdmin ||
                    currentUser?.membership?.isGuide) && (
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
                {dream.approved &&
                  dream.minGoalGrants > 0 &&
                  currentUser?.membership?.isAdmin && (
                    <>
                      <button
                        className={css.dropdownButton}
                        onClick={() => {
                          setPrePostFundModalOpen(true);
                          setActionsDropdownOpen(false);
                        }}
                      >
                        {event.grantingHasClosed ? "Post-fund" : "Pre-fund"}
                      </button>
                    </>
                  )}
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
              </Dropdown>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 group">
        <h2 className="mb-2 font-medium hidden md:block relative">
          <span className="mr-2">Co-creators</span>
          {canEdit && (
            <div className="absolute top-0 right-0 invisible group-hover:visible">
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
              key={member.user.id}
              className="flex items-center mr-2 md:mr-3 sm:mb-2"
            >
              <Avatar user={member.user} />{" "}
              <span className="ml-2 text-gray-700 hidden md:block">
                {member.user.name}
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
          currentUser={currentUser}
        />
      </div>
      <PreOrPostFundModal
        open={prePostFundModalOpen}
        handleClose={() => setPrePostFundModalOpen(false)}
        dream={dream}
        event={event}
      />
    </>
  );
};
