import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import TextField from "components/TextField";
import Button from "components/Button";
import { SelectField } from "../SelectInput";
import ColorPicker from "../ColorPicker";
import slugify from "../../utils/slugify";
import DeleteEventModal from "./DeleteEventModal";
import toast from "react-hot-toast";
import router from "next/router";

const EDIT_EVENT = gql`
  mutation editCollection(
    $orgId: ID!
    $collectionId: ID!
    $slug: String
    $title: String
    $archived: Boolean
    $registrationPolicy: RegistrationPolicy
    $color: String
  ) {
    editCollection(
      orgId: $orgId
      collectionId: $collectionId
      slug: $slug
      title: $title
      archived: $archived
      registrationPolicy: $registrationPolicy
      color: $color
    ) {
      id
      title
      slug
      archived
      registrationPolicy
      color
    }
  }
`;

export default function GeneralSettings({
  event,
  currentOrg,
  currentOrgMember,
}) {
  const [{ fetching: loading }, editCollection] = useMutation(EDIT_EVENT);
  const [color, setColor] = useState(event.color);
  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);
  const {
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm();

  const startUrl = `${process.env.DEPLOY_URL}/${currentOrg.slug}/`;

  return (
    <div className="px-6">
      <h2 className="text-2xl font-semibold">General</h2>
      <form
        onSubmit={handleSubmit((variables) => {
          editCollection({
            ...variables,
            orgId: currentOrg.id,
            collectionId: event.id,
            archived: variables.archived === "true",
            color,
          }).then(({ error }) => {
            if (error) {
              toast.error(error.message.replace("[GraphQL]", ""));
            } else {
              toast.success("Settings updated!");
              router.replace(`/${currentOrg.slug}/${variables.slug}/settings`);
            }
          });
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
          label="URL"
          placeholder="Slug"
          defaultValue={event.slug}
          inputRef={register}
          startAdornment={startUrl}
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

        {currentOrgMember.isAdmin && (
          <SelectField
            name="archived"
            label="Archive collection"
            defaultValue={event.archived ? "true" : "false"}
            inputRef={register}
            className="my-4"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </SelectField>
        )}

        {currentOrgMember.isAdmin && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4">Danger Zone</h2>
            <Button
              onClick={() => setIsDeleteModalOpened(true)}
              variant="secondary"
              color="red"
            >
              Delete this collection
            </Button>
          </>
        )}

        <div className="mt-2 flex justify-end">
          <Button
            color={color}
            type="submit"
            disabled={!(isDirty || event.color !== color)}
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
          currentOrg={currentOrg}
        />
      )}
    </div>
  );
}
