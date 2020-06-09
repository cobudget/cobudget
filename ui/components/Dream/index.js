import gql from "graphql-tag";
import { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import { Button, IconButton } from "@material-ui/core";
import { Edit as EditIcon } from "@material-ui/icons";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import { Tooltip } from "react-tippy";

import stringToHslColor from "utils/stringToHslColor";
import { isMemberOfDream } from "utils/helpers";
import thousandSeparator from "utils/thousandSeparator";

import DreamButton from "components/Button";
import Avatar from "components/Avatar";
import TextField from "components/TextField";
import { EditIcon as NewEditIcon } from "components/Icons";
import NewIconButton from "components/IconButton";
import Label from "components/Label";
import ProgressBar from "components/ProgressBar";

import EditCocreatorsModal from "./EditCocreatorsModal";
import Images from "./Images";
import GiveGrantlingsModal from "./GiveGrantlingsModal";
import PreOrPostFundModal from "./PreOrPostFundModal";
import Comments from "./Comments";
import Budget from "./Budget";

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
  ) {
    editDream(
      dreamId: $dreamId
      title: $title
      description: $description
      summary: $summary
      images: $images
      budgetItems: $budgetItems
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

const Summary = ({ summary, canEdit, dreamId }) => {
  const [editDream, { loading }] = useMutation(EDIT_DREAM_MUTATION, {
    variables: { dreamId },
  });

  const { handleSubmit, register, errors } = useForm();

  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(summary ?? "");
  if (editing)
    return (
      <>
        <form
          onSubmit={handleSubmit((variables) =>
            editDream({ variables })
              .then(() => setEditing(false))
              .catch((err) => alert(err.message))
          )}
        >
          <TextField
            className="mb-2"
            multiline
            name="summary"
            placeholder="Summary"
            inputRef={register}
            inputProps={{
              maxLength: 160,
              value: inputValue,
              onChange: (e) => setInputValue(e.target.value),
            }}
            autoFocus
          />
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600 font-medium pl-4">
              {160 - inputValue.length} characters remaining
            </div>
            <div className="flex">
              <DreamButton
                className="mr-2"
                variant="secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </DreamButton>

              <DreamButton loading={loading} type="submit">
                Save
              </DreamButton>
            </div>
          </div>
        </form>
      </>
    );

  if (summary)
    return (
      <div className="whitespace-pre-line pb-4 text-lg text-gray-900 relative group">
        {summary}
        {canEdit && (
          <div className="absolute top-0 right-0 invisible group-hover:visible">
            <Tooltip title="Edit summary" position="bottom" size="small">
              <NewIconButton onClick={() => setEditing(true)}>
                <NewEditIcon className="h-6 w-6" />
              </NewIconButton>
            </Tooltip>
          </div>
        )}
      </div>
    );

  if (canEdit)
    return (
      <button
        onClick={() => setEditing(true)}
        className="block w-full h-20 text-gray-600 font-semibold rounded-lg border-3 border-dashed hover:bg-gray-100 mb-4 focus:outline-none focus:bg-gray-100"
      >
        + Add summary
      </button>
    );

  return null;
};

const Title = ({ title, canEdit, dreamId }) => {
  const [editDream, { loading }] = useMutation(EDIT_DREAM_MUTATION, {
    variables: { dreamId },
  });
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(title ?? "");
  if (editing) {
    return (
      <>
        <TextField
          className="mb-2"
          placeholder="Title"
          size="large"
          inputProps={{
            maxLength: 100,
            value: inputValue,
            onChange: (e) => setInputValue(e.target.value),
          }}
          autoFocus
        />
        <div className="flex justify-end  mb-4">
          <div className="flex">
            <DreamButton
              className="mr-2"
              variant="secondary"
              onClick={() => setEditing(false)}
            >
              Cancel
            </DreamButton>

            <DreamButton
              loading={loading}
              onClick={() =>
                editDream({ variables: { title: inputValue } })
                  .then(() => setEditing(false))
                  .catch((err) => alert(err.message))
              }
            >
              Save
            </DreamButton>
          </div>
        </div>
      </>
    );
  }
  if (title) {
    return (
      <div className="flex items-start justify-between group relative">
        <h1 className="mb-2 text-4xl font-medium">{title}</h1>
        {canEdit && (
          <div className="absolute top-0 right-0 invisible group-hover:visible">
            <Tooltip title="Edit title" position="bottom" size="small">
              <NewIconButton onClick={() => setEditing(true)}>
                <NewEditIcon className="h-6 w-6" />
              </NewIconButton>
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
};

const Description = ({ description, dreamId, canEdit }) => {
  const [editDream, { loading }] = useMutation(EDIT_DREAM_MUTATION, {
    variables: { dreamId },
  });

  const { handleSubmit, register, errors } = useForm();

  const [editing, setEditing] = useState(false);

  if (editing)
    return (
      <form
        onSubmit={handleSubmit((variables) =>
          editDream({ variables })
            .then(() => setEditing(false))
            .catch((err) => alert(err.message))
        )}
      >
        <TextField
          name="description"
          placeholder="Description"
          inputRef={register}
          multiline
          rows={10}
          defaultValue={description}
          autoFocus
          className="mb-2"
        />
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600 font-medium pl-4">
            Markdown allowed
          </div>
          <div className="flex">
            <DreamButton
              onClick={() => setEditing(false)}
              variant="secondary"
              className="mr-2"
            >
              Cancel
            </DreamButton>
            <DreamButton loading={loading}>Save</DreamButton>
          </div>
        </div>
      </form>
    );

  if (description)
    return (
      <div className="relative group pb-4">
        <ReactMarkdown source={description} className="markdown" />
        {canEdit && (
          <div className="absolute top-0 right-0 invisible group-hover:visible">
            <Tooltip title="Edit description" position="bottom" size="small">
              <NewIconButton onClick={() => setEditing(true)}>
                <NewEditIcon className="h-6 w-6" />
              </NewIconButton>
            </Tooltip>
          </div>
        )}
      </div>
    );

  if (canEdit)
    return (
      <button
        onClick={() => setEditing(true)}
        className="block w-full h-64 text-gray-600 font-semibold rounded-lg border-3 border-dashed focus:outline-none focus:bg-gray-100 hover:bg-gray-100 mb-4"
      >
        + Add description
      </button>
    );
  return null;
};

const Dream = ({ dream, event, currentUser }) => {
  const [approveForGranting] = useMutation(APPROVE_FOR_GRANTING_MUTATION);
  const [reclaimGrants] = useMutation(RECLAIM_GRANTS_MUTATION);
  const [publishDream] = useMutation(PUBLISH_DREAM_MUTATION, {
    variables: { dreamId: dream.id },
  });
  console.log({ dream });
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

            <Budget
              dreamId={dream.id}
              budgetItems={dream.budgetItems}
              canEdit={canEdit}
              currency={event.currency}
              allowStretchGoals={event.allowStretchGoals}
              event={event}
            />

            <hr className="mb-4 mt-1" />

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

            <div className="mt-5">
              <h2 className="mb-2 font-medium hidden md:block">
                <span className="mr-2">Co-creators</span>
                {canEdit && (
                  <NewIconButton onClick={() => setCocreatorModalOpen(true)}>
                    <NewEditIcon className="h-5 w-5" />
                  </NewIconButton>
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
