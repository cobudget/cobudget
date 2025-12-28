import { useState, useEffect } from "react";
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
import PublicRoundWarning from "./PublicRoundWarning";
import { HIDDEN, PUBLIC } from "../../constants";

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
  const [isHidden, setIsHidden] = useState();
  const intl = useIntl();
  const {
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm();

  const titleField = register("title");
  const slugField = register("slug");
  const visibilityField = register("visibility");
  const registrationPolicyField = register("registrationPolicy");
  const archivedField = register("archived");

  const startUrl = `${process.env.DEPLOY_URL}/${currentGroup?.slug ?? "c"}/`;
  const isAdmin =
    currentUser.currentGroupMember?.isAdmin ||
    currentUser.currentCollMember?.isAdmin;

  useEffect(() => {
    if (round) {
      setIsHidden(round.visibility === HIDDEN);
    }
  }, [round]);

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
          name={titleField.name}
          testid="round-title"
          label={intl.formatMessage({ defaultMessage: "Title" })}
          placeholder={intl.formatMessage({ defaultMessage: "Title" })}
          defaultValue={round.title}
          inputRef={titleField.ref}
          inputProps={{ onChange: titleField.onChange }}
          className="my-4"
        />

        <TextField
          name={slugField.name}
          testid="round-slug"
          label={intl.formatMessage({ defaultMessage: "URL" })}
          placeholder={intl.formatMessage({ defaultMessage: "Slug" })}
          defaultValue={round.slug}
          inputRef={slugField.ref}
          startAdornment={startUrl}
          inputProps={{
            onChange: slugField.onChange,
            onBlur: (e) => {
              setValue("slug", slugify(e.target.value));
            },
          }}
          className="my-4"
        />

        <SelectField
          name={visibilityField.name}
          label={intl.formatMessage({ defaultMessage: "Visibility" })}
          defaultValue={round.visibility}
          inputRef={visibilityField.ref}
          inputProps={{
            onChange: (e) => {
              visibilityField.onChange(e);
              setIsHidden(e.target.value === HIDDEN);
            },
          }}
          className="my-4"
        >
          <option value="PUBLIC">
            {intl.formatMessage({ defaultMessage: "Public" })}
          </option>
          <option value="HIDDEN">
            {intl.formatMessage({ defaultMessage: "Hidden" })}
          </option>
        </SelectField>

        <PublicRoundWarning
          group={currentGroup}
          visibility={isHidden ? HIDDEN : PUBLIC}
        />

        <SelectField
          name={registrationPolicyField.name}
          label={intl.formatMessage({ defaultMessage: "Registration policy" })}
          defaultValue={round.registrationPolicy}
          inputRef={registrationPolicyField.ref}
          inputProps={{ onChange: registrationPolicyField.onChange }}
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
            name={archivedField.name}
            label={intl.formatMessage({ defaultMessage: "Archive round" })}
            defaultValue={round.archived ? "true" : "false"}
            inputRef={archivedField.ref}
            inputProps={{ onChange: archivedField.onChange }}
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
