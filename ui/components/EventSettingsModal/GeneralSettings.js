import { useState } from "react";
import { useForm } from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import TextField from "components/TextField";
import Button from "components/Button";
import { SelectField } from "../SelectInput";
import ColorPicker from "../ColorPicker";
import slugify from "../../utils/slugify";
import DeleteEventModal from "./DeleteEventModal";

const EDIT_EVENT = gql`
  mutation editEvent(
    $eventId: ID!
    $slug: String
    $title: String
    $registrationPolicy: RegistrationPolicy
    $info: String
    $color: String
    $about: String
  ) {
    editEvent(
      eventId: $eventId
      slug: $slug
      title: $title
      registrationPolicy: $registrationPolicy
      info: $info
      color: $color
      about: $about
    ) {
      id
      title
      slug
      registrationPolicy
      info
      color
      about
    }
  }
`;

export default function GeneralSettings({
  event,
  currentOrgMember,
  handleClose,
}) {
  const [editEvent, { loading }] = useMutation(EDIT_EVENT);
  const [color, setColor] = useState(event.color);
  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);
  const { handleSubmit, register, setValue } = useForm();

  return (
    <div className="px-6">
      <h2 className="text-2xl font-semibold">General</h2>
      <form
        onSubmit={handleSubmit((variables) => {
          editEvent({
            variables: {
              ...variables,
              eventId: event.id,
              totalBudget: Number(variables.totalBudget),
              grantValue: Number(variables.grantValue),
              grantsPerMember: Number(variables.grantsPerMember),
              dreamReviewIsOpen: variables.dreamReviewIsOpen === "true",
              color,
            },
          })
            .then(() => handleClose())
            .catch((error) => alert(error.message));
        })}
      >
        <TextField
          name="title"
          label="Title"
          placeholder="Title"
          defaultValue={event.title}
          inputRef={register}
          className="my-4"
        />

        <TextField
          name="slug"
          label="Slug"
          placeholder="Slug"
          defaultValue={event.slug}
          inputRef={register}
          inputProps={{
            onBlur: (e) => {
              setValue("slug", slugify(e.target.value));
            },
          }}
          className="my-4"
        />

        <SelectField
          name="registrationPolicy"
          label="Registration policy"
          defaultValue={event.registrationPolicy}
          inputRef={register}
          className="my-4"
        >
          <option value="OPEN">Open</option>
          <option value="REQUEST_TO_JOIN">Request to join</option>
          <option value="INVITE_ONLY">Invite only</option>
        </SelectField>

        <ColorPicker color={color} setColor={(color) => setColor(color)} />

        <TextField
          name="info"
          label="Homepage message (markdown allowed)"
          defaultValue={event.info}
          multiline
          rows={5}
          inputRef={register}
          className="my-4"
        />

        <TextField
          name="about"
          label="About (markdown allowed)"
          defaultValue={event.about}
          multiline
          rows={5}
          inputRef={register}
          className="my-4"
        />

        {currentOrgMember.isOrgAdmin && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4">Danger Zone</h2>
            <Button
              onClick={() => setIsDeleteModalOpened(true)}
              variant="secondary"
              color="red"
            >
              Delete this event
            </Button>
          </>
        )}

        <div className="mt-2 flex justify-end">
          <Button
            color={color}
            onClick={handleClose}
            variant="secondary"
            className="mr-2"
          >
            Close
          </Button>
          <Button
            color={color}
            type="submit"
            //disabled={!(isDirty || event.color !== color)}
            loading={loading}
          >
            Save
          </Button>
        </div>
      </form>

      {isDeleteModalOpened && (
        <DeleteEventModal
          event={event}
          handleClose={() => {
            setIsDeleteModalOpened(false);
          }}
        />
      )}
    </div>
  );
}
