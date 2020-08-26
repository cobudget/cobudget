import { useState } from "react";
import { useForm } from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { Box } from "@material-ui/core";
import TextField from "components/TextField";
import Button from "components/Button";
import { SelectField } from "../SelectInput";
import ColorPicker from "../ColorPicker";
import slugify from "../../utils/slugify";

const EDIT_EVENT = gql`
  mutation editEvent(
    $eventId: ID!
    $slug: String
    $title: String
    $registrationPolicy: RegistrationPolicy
    $info: String
    $color: String
  ) {
    editEvent(
      eventId: $eventId
      slug: $slug
      title: $title
      registrationPolicy: $registrationPolicy
      info: $info
      color: $color
    ) {
      id
      title
      slug
      registrationPolicy
      info
      color
    }
  }
`;

export default ({ event, handleClose }) => {
  const [editEvent, { loading }] = useMutation(EDIT_EVENT);
  const [color, setColor] = useState(event.color);
  const {
    handleSubmit,
    register,
    setValue,
    formState: { isDirty },
    errors,
  } = useForm();

  return (
    <>
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

        <div className="mt-2 flex justify-end">
          <Button onClick={handleClose} variant="secondary" className="mr-2">
            Close
          </Button>
          <Button type="submit" disabled={!isDirty} loading={loading}>
            Save
          </Button>
        </div>
      </form>
    </>
  );
};
