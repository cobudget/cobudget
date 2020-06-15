import gql from "graphql-tag";
import { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import { Button } from "@material-ui/core";
// import { Edit as EditIcon } from "@material-ui/icons";
import { Tooltip } from "react-tippy";

import stringToHslColor from "utils/stringToHslColor";
import { isMemberOfDream } from "utils/helpers";
import thousandSeparator from "utils/thousandSeparator";

import Avatar from "components/Avatar";
import IconButton from "components/IconButton";
import Label from "components/Label";
import ProgressBar from "components/ProgressBar";
import { EditIcon } from "components/Icons";

import EditCocreatorsModal from "./EditCocreatorsModal";
import Images from "./Images";
import GiveGrantlingsModal from "./GiveGrantlingsModal";
import PreOrPostFundModal from "./PreOrPostFundModal";
import Comments from "./Comments";
import Budget from "./Budget";
import Summary from "./Summary";
import Title from "./Title";
import Description from "./Description";
import EditCustomFields from "./CustomFields/EditCustomFields";

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

const EDIT_DREAM_MUTATION = gql`
  mutation EditDream(
    $dreamId: ID!
    $title: String
    $description: String
    $summary: String
    $images: [ImageInput]
    $budgetItems: [BudgetItemInput]
    $customFields: [CustomFieldInput]
  ) {
    editDream(
      dreamId: $dreamId
      title: $title
      description: $description
      summary: $summary
      images: $images
      budgetItems: $budgetItems
      customFields: $customFields
    ) {
      id
      description
      summary
      title
      minGoal
      maxGoal
      minGoalGrants
      maxGoalGrants
      images {
        small
        large
      }
      budgetItems {
        description
        min
        max
      }
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

  const canEdit =
    currentUser?.membership?.isAdmin ||
    currentUser?.membership?.isGuide ||
    isMemberOfDream(currentUser, dream);

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
            <Title title={dream.title} dreamId={dream.id} canEdit={canEdit} />
            {dream.customFields && dream.customFields.electricity}
            <Summary
              dreamId={dream.id}
              summary={dream.summary}
              canEdit={canEdit}
            />

            <Images
              images={dream.images}
              size={100}
              canEdit={canEdit}
              dreamId={dream.id}
            />

            <Description
              description={dream.description}
              dreamId={dream.id}
              canEdit={canEdit}
            />

            <EditCustomFields
              dreamId={dream.id}
              customFields={dream.customFields} 
              canEdit={canEdit}
            />

            <Budget
              dreamId={dream.id}
              budgetItems={dream.budgetItems}
              canEdit={canEdit}
              currency={event.currency}
              allowStretchGoals={event.allowStretchGoals}
              event={event}
            />

            <hr className="mb-4 mt-1" />

            <Comments
              currentUser={currentUser}
              comments={dream.comments}
              dreamId={dream.id}
            />
          </div>
          <div className="order-first md:order-last">
            {(dream.approved || canEdit) && (
              <div className="-mt-20 bg-white rounded-lg shadow-md p-5">
                {dream.approved && (
                  <>
                    <div
                      className={`grid gap-1 text-center ${
                        dream.maxGoalGrants ? "grid-cols-3" : "grid-cols-2"
                      }`}
                    >
                      <div>
                        <span className="block text-xl font-medium">
                          {dream.currentNumberOfGrants}
                        </span>
                        <span className="uppercase text-sm">Funded</span>
                      </div>
                      <div>
                        <span className="block text-xl font-medium">
                          {dream.minGoalGrants
                            ? thousandSeparator(dream.minGoalGrants)
                            : "-"}
                        </span>

                        <span className="uppercase text-sm">Goal</span>
                      </div>
                      {dream.maxGoalGrants && (
                        <div>
                          <span className="block text-xl font-medium">
                            {thousandSeparator(dream.maxGoalGrants)}
                          </span>

                          <span className="uppercase text-sm">Max. goal</span>
                        </div>
                      )}
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
                {canEdit && (
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

            <div className="mt-5 group">
              <h2 className="mb-2 font-medium hidden md:block relative">
                <span className="mr-2">Co-creators</span>
                {canEdit && (
                  <div className="absolute top-0 right-0 invisible group-hover:visible">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dream;
