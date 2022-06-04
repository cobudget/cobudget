import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import TextField from "components/TextField";
import Button from "components/Button";
import { SelectField } from "../SelectInput";
import ColorPicker from "../ColorPicker";
import slugify from "../../utils/slugify";
import DeleteRoundModal from "./DeleteRoundModal";
import toast from "react-hot-toast";
import router from "next/router";
import { FormattedMessage, useIntl } from "react-intl";

const EDIT_ROUND = gql`
  mutation editRound(
    $roundId: ID!
    $slug: String
    $title: String
    $archived: Boolean
    $registrationPolicy: RegistrationPolicy
    $visibility: Visibility
    $color: String
  ) {
    editRound(
      roundId: $roundId
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

export default function GeneralSettings({ round, currentGroup, currentUser }) {
  const [{ fetching: loading }, editRound] = useMutation(EDIT_ROUND);
  const [color, setColor] = useState(round.color);
  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);
  const intl = useIntl();
  const {
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm();

  const startUrl = `${process.env.DEPLOY_URL}/${currentGroup?.slug ?? "c"}/`;
  const isAdmin =
    currentUser.currentGroupMember?.isAdmin ||
    currentUser.currentCollMember?.isAdmin;
  return (
    <div className="px-6">
      <h2 className="text-2xl font-semibold">
        <FormattedMessage defaultMessage="General" />
      </h2>
      <form
        onSubmit={handleSubmit((variables) => {
          editRound({
            ...variables,
            roundId: round.id,
            archived: variables.archived === "true",
            color,
          }).then(({ error }) => {
            if (error) {
              toast.error(error.message.replace("[GraphQL]", ""));
            } else {
              toast.success(
                intl.formatMessage({ defaultMessage: "Settings updated!" })
              );
              router.replace(
                `/${currentGroup?.slug ?? "c"}/${variables.slug}/settings`
              );
            }
          });
        })}
      >
        <TextField
          name="title"
          label={intl.formatMessage({ defaultMessage: "Title" })}
          placeholder={intl.formatMessage({ defaultMessage: "Title" })}
          defaultValue={round.title}
          inputRef={register}
          className="my-4"
        />

        <TextField
          name="slug"
          label={intl.formatMessage({ defaultMessage: "URL" })}
          placeholder={intl.formatMessage({ defaultMessage: "Slug" })}
          defaultValue={round.slug}
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
          label={intl.formatMessage({ defaultMessage: "Visibility" })}
          defaultValue={round.visibility}
          inputRef={register}
          className="my-4"
        >
          <option value="PUBLIC">
            {intl.formatMessage({ defaultMessage: "Public" })}
          </option>
          <option value="HIDDEN">
            {intl.formatMessage({ defaultMessage: "Hidden" })}
          </option>
        </SelectField>

        <SelectField
          name="registrationPolicy"
          label={intl.formatMessage({ defaultMessage: "Registration policy" })}
          defaultValue={round.registrationPolicy}
          inputRef={register}
          className="my-4"
        >
          <option value="OPEN">
            {intl.formatMessage({ defaultMessage: "Open" })}
          </option>
          <option value="REQUEST_TO_JOIN">
            {intl.formatMessage({ defaultMessage: "Request to join" })}
          </option>
          <option value="INVITE_ONLY">
            {intl.formatMessage({ defaultMessage: "Invite only" })}
          </option>
        </SelectField>

        <ColorPicker color={color} setColor={(color) => setColor(color)} />

        {isAdmin && (
          <SelectField
            name="archived"
            label={intl.formatMessage({ defaultMessage: "Archive round" })}
            defaultValue={round.archived ? "true" : "false"}
            inputRef={register}
            className="my-4"
          >
            <option value="true">
              {intl.formatMessage({ defaultMessage: "Yes" })}
            </option>
            <option value="false">
              {intl.formatMessage({ defaultMessage: "No" })}
            </option>
          </SelectField>
        )}

        {isAdmin && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4">
              <FormattedMessage defaultMessage="Danger Zone" />
            </h2>
            <Button
              onClick={() => setIsDeleteModalOpened(true)}
              variant="secondary"
              color="red"
            >
              <FormattedMessage defaultMessage="Delete this round" />
            </Button>
          </>
        )}

        <div className="mt-2 flex justify-end">
          <Button
            color={color}
            type="submit"
            disabled={!(isDirty || round.color !== color)}
            loading={loading}
          >
            <FormattedMessage defaultMessage="Save" />
          </Button>
        </div>
      </form>

      {isDeleteModalOpened && (
        <DeleteRoundModal
          round={round}
          handleClose={() => {
            setIsDeleteModalOpened(false);
          }}
          currentGroup={currentGroup}
        />
      )}
    </div>
  );
}
