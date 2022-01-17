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
    $collectionId: ID!
    $slug: String
    $title: String
    $archived: Boolean
    $registrationPolicy: RegistrationPolicy
    $visibility: Visibility
    $color: String
  ) {
    editCollection(
      collectionId: $collectionId
      slug: $slug
      title: $title
      archived: $archived
      registrationPolicy: $registrationPolicy
      visibility: $visibility
      color: $color
    ) {
      id
      title
      slug
      archived
      registrationPolicy
      visibility
      color
    }
  }
`;

export default function GeneralSettings({
  collection,
  currentOrg,
  currentUser,
}) {
  const [{ fetching: loading }, editCollection] = useMutation(EDIT_EVENT);
  const [color, setColor] = useState(collection.color);
  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);
  const {
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm();

  const startUrl = `${process.env.DEPLOY_URL}/${currentOrg?.slug ?? "c"}/`;
  const isAdmin =
    currentUser.currentOrgMember?.isAdmin ||
    currentUser.currentCollMember?.isAdmin;
  return (
    <div className="px-6">
      <h2 className="text-2xl font-semibold">General</h2>
      <form
        onSubmit={handleSubmit((variables) => {
          editCollection({
            ...variables,
            collectionId: collection.id,
            archived: variables.archived === "true",
            color,
          }).then(({ error }) => {
            if (error) {
              toast.error(error.message.replace("[GraphQL]", ""));
            } else {
              toast.success("Settings updated!");
              router.replace(
                `/${currentOrg?.slug ?? "c"}/${variables.slug}/settings`
              );
            }
          });
        })}
      >
        <TextField
          name="title"
          label="Title"
          placeholder="Title"
          defaultValue={collection.title}
          inputRef={register}
          className="my-4"
        />

        <TextField
          name="slug"
          label="URL"
          placeholder="Slug"
          defaultValue={collection.slug}
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
          name="visibility"
          label="Visibility"
          defaultValue={collection.visibility}
          inputRef={register}
          className="my-4"
        >
          <option value="PUBLIC">Public</option>
          <option value="HIDDEN">Hidden</option>
        </SelectField>

        <SelectField
          name="registrationPolicy"
          label="Registration policy"
          defaultValue={collection.registrationPolicy}
          inputRef={register}
          className="my-4"
        >
          <option value="OPEN">Open</option>
          <option value="REQUEST_TO_JOIN">Request to join</option>
          <option value="INVITE_ONLY">Invite only</option>
        </SelectField>

        <ColorPicker color={color} setColor={(color) => setColor(color)} />

        {isAdmin && (
          <SelectField
            name="archived"
            label="Archive collection"
            defaultValue={collection.archived ? "true" : "false"}
            inputRef={register}
            className="my-4"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </SelectField>
        )}

        {isAdmin && (
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
            disabled={!(isDirty || collection.color !== color)}
            loading={loading}
          >
            Save
          </Button>
        </div>
      </form>

      {isDeleteModalOpened && (
        <DeleteEventModal
          collection={collection}
          handleClose={() => {
            setIsDeleteModalOpened(false);
          }}
          currentOrg={currentOrg}
        />
      )}
    </div>
  );
}
