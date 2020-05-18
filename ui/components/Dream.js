import gql from "graphql-tag";
import { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import { Button, Tooltip, IconButton } from "@material-ui/core";
import { Edit as EditIcon } from "@material-ui/icons";
import Router from "next/router";

import Label from "./Label";
import stringToHslColor from "../utils/stringToHslColor";
import { isMemberOfDream } from "../utils/helpers";
import Avatar from "./Avatar";
import Gallery from "./Gallery";
import GiveGrantlingsModal from "./GiveGrantlingsModal";
import PreOrPostFundModal from "./PreOrPostFundModal";
import ProgressBar from "./ProgressBar";
import Comments from "./Comments";
import EditCocreatorsModal from "./EditCocreatorsModal";

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

const Dream = ({ dream, event, currentUser }) => {
  const [approveForGranting] = useMutation(APPROVE_FOR_GRANTING_MUTATION);
  const [reclaimGrants] = useMutation(RECLAIM_GRANTS_MUTATION);
  const [publishDream] = useMutation(PUBLISH_DREAM_MUTATION, {
    variables: { dreamId: dream.id },
  });

  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [prePostFundModalOpen, setPrePostFundModalOpen] = useState(false);
  const [cocreatorModalOpen, setCocreatorModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
      {!dream.published && (
        <Label className="absolute right-0 m-5 text-sm">Unpublished</Label>
      )}
      {dream.images.length > 0 ? (
        <img
          className="h-64 md:h-88 w-full object-cover object-center"
          src={dream.images[0].large}
          style={{ background: stringToHslColor(dream.title) }}
        />
      ) : (
        <div
          className="h-64 md:h-88 w-full"
          style={{ background: stringToHslColor(dream.title) }}
        />
      )}

      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-sidebar gap-2 md:gap-6 relative">
          <div>
            <div className="flex items-start justify-between">
              <h1 className="mb-2 text-4xl font-medium">{dream.title}</h1>
              {isMemberOfDream(currentUser, dream) && (
                <IconButton
                  onClick={() =>
                    Router.push(
                      "/[event]/[dream]/edit",
                      `/${event.slug}/${dream.slug}/edit`
                    )
                  }
                >
                  <EditIcon />
                </IconButton>
              )}
            </div>

            <p className="whitespace-pre-line mb-4 text-lg text-gray-900">
              {dream.summary}
            </p>

            <Gallery images={dream.images} size={100} />

            <p className="whitespace-pre-line">{dream.description}</p>

            {dream.minGoal && (
              <div className="my-5">
                <h2 className="mb-2 text-2xl font-medium">Funding goals</h2>

                <p>
                  Min goal: {dream.minGoal} {event.currency}
                </p>
                {dream.maxGoal && (
                  <p>
                    Max goal: {dream.maxGoal} {event.currency}
                  </p>
                )}
              </div>
            )}

            {dream.budgetItems && dream.budgetItems.length > 0 && (
              <>
                <div className="my-5">
                  <h2 className="mb-1 text-2xl font-medium">Budget</h2>
                  <table className="table-fixed w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 w-3/4">Description</th>
                        <th className="px-4 py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dream.budgetItems.map((budgetItem, i) => (
                        <tr key={i} className="bg-white even:bg-gray-100">
                          <td className="border px-4 py-2">
                            {budgetItem.description}
                          </td>
                          <td className="border px-4 py-2">
                            {budgetItem.amount} {event.currency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <h2 className="mb-1 text-2xl font-medium" id="comments">
              {dream.numberOfComments}{" "}
              {dream.numberOfComments === 1 ? "comment" : "comments"}
            </h2>
            <Comments
              currentUser={currentUser}
              comments={dream.comments}
              dreamId={dream.id}
            />
          </div>
          <div className="order-first md:order-last">
            {(dream.approved ||
              (currentUser &&
                currentUser.membership &&
                (currentUser.membership.isAdmin ||
                  currentUser.membership.isGuide)) ||
              isMemberOfDream(currentUser, dream)) && (
              <div className="-mt-20 bg-white rounded-lg shadow-md p-5">
                {dream.approved && (
                  <>
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div>
                        <span className="block text-2xl font-medium">
                          {dream.currentNumberOfGrants}
                        </span>
                        <span className="uppercase text-sm">Funded</span>
                      </div>
                      <div>
                        <span className="block text-2xl font-medium">
                          {dream.minGoalGrants ? dream.minGoalGrants : "-"}
                        </span>

                        <span className="uppercase text-sm">Min. goal</span>
                      </div>
                      <div>
                        <span className="block text-2xl font-medium">
                          {dream.maxGoalGrants ? dream.maxGoalGrants : "-"}
                        </span>

                        <span className="uppercase text-sm">Max. goal</span>
                      </div>
                    </div>

                    <div className="my-4">
                      <ProgressBar
                        currentNumberOfGrants={dream.currentNumberOfGrants}
                        minGoalGrants={dream.minGoalGrants}
                        maxGoalGrants={dream.maxGoalGrants}
                        height={10}
                      />
                    </div>
                    {currentUser &&
                      currentUser.membership &&
                      currentUser.membership.availableGrants > 0 && (
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
                {(isMemberOfDream(currentUser, dream) ||
                  (currentUser && currentUser.membership.isAdmin)) && (
                  <Button
                    color={dream.published ? "default" : "primary"}
                    variant={dream.published ? "text" : "contained"}
                    onClick={() =>
                      publishDream({
                        variables: { unpublish: dream.published },
                      })
                    }
                    fullWidth
                  >
                    {dream.published ? "Unpublish" : "Publish"}
                  </Button>
                )}
                {currentUser &&
                  currentUser.membership &&
                  (currentUser.membership.isAdmin ||
                    currentUser.membership.isGuide) && (
                    <div>
                      <div className="my-2">
                        {!event.grantingHasClosed && dream.approved ? (
                          <Button
                            onClick={() =>
                              confirm(
                                "Are you sure you would like to unapprove this dream?"
                              ) &&
                              approveForGranting({
                                variables: {
                                  dreamId: dream.id,
                                  approved: false,
                                },
                              }).catch((err) => alert(err.message))
                            }
                            fullWidth
                          >
                            Unapprove for granting
                          </Button>
                        ) : (
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

                      {currentUser.membership.isAdmin && (
                        <>
                          <div className="my-2">
                            {event.grantingHasClosed &&
                              dream.currentNumberOfGrants > 0 && (
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

                          {dream.approved && (
                            <>
                              <Button
                                fullWidth
                                onClick={() => setPrePostFundModalOpen(true)}
                              >
                                {event.grantingHasClosed
                                  ? "Post-fund"
                                  : "Pre-fund"}
                              </Button>
                              <PreOrPostFundModal
                                open={prePostFundModalOpen}
                                handleClose={() =>
                                  setPrePostFundModalOpen(false)
                                }
                                dream={dream}
                                event={event}
                              />
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
              </div>
            )}

            <div className="mt-5">
              <h2 className="mb-2 font-medium hidden md:block">
                <span className="mr-2">Co-creators</span>
                {isMemberOfDream(currentUser, dream) && (
                  <IconButton
                    onClick={() => setCocreatorModalOpen(true)}
                    size="small"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </h2>

              <div className="flex items-center flex-wrap">
                {dream.cocreators.map((member) => (
                  // <Tooltip key={member.user.id} title={member.user.name}>
                  <div
                    key={member.user.id}
                    className="flex items-center mr-2 md:mr-3"
                  >
                    <Avatar user={member.user} />{" "}
                    <span className="ml-2 text-gray-700 hidden md:block">
                      {member.user.name}
                    </span>
                  </div>
                  // </Tooltip>
                ))}
                <div className="block md:hidden">
                  {isMemberOfDream(currentUser, dream) && (
                    <IconButton
                      onClick={() => setCocreatorModalOpen(true)}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dream;
