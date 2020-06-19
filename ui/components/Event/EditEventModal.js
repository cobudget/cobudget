import { useForm } from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { TextField, Box, Button, Modal } from "@material-ui/core";
import SelectInput from "../SelectInput";
import slugify from "../../utils/slugify";
import CustomFields from "./CustomFields";

const EDIT_EVENT = gql`
  mutation editEvent(
    $eventId: ID!
    $slug: String
    $title: String
    $registrationPolicy: RegistrationPolicy
    $info: String
  ) {
    editEvent(
      eventId: $eventId
      slug: $slug
      title: $title
      registrationPolicy: $registrationPolicy
      info: $info
    ) {
      id
      title
      slug
      registrationPolicy
      info
    }
  }
`;

export default ({ event, open, handleClose }) => {
  const [editEvent] = useMutation(EDIT_EVENT);

  const { handleSubmit, register, setValue, formState, errors } = useForm();

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        className="flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-sm">
          <h2 className="text-2xl">Event details</h2>
          <Box my={2}>
            <CustomFields
              event={event}
              customFields={event.customFields}
            />
          </Box>
          <form
            onSubmit={handleSubmit((variables) => {
              editEvent({
                variables: {
                  ...variables,
                  eventId: event.id,
                  totalBudget: Number(variables.totalBudget),
                  grantValue: Number(variables.grantValue),
                  grantsPerMember: Number(variables.grantsPerMember),
                },
              })
                .then((data) => {
                  // Add "Snackbar" success message from material UI
                  handleClose();
                })
                .catch((error) => {
                  alert(error.message);
                });
            })}
          >
            <Box>
              <Box my={2}>
                <TextField
                  name="title"
                  label="Title"
                  defaultValue={event.title}
                  variant="outlined"
                  fullWidth
                  inputRef={register}
                />
              </Box>
              <Box my={2}>
                <TextField
                  name="slug"
                  label="Slug"
                  defaultValue={event.slug}
                  fullWidth
                  inputRef={register}
                  InputProps={{
                    onBlur: (e) => {
                      setValue("slug", slugify(e.target.value));
                    },
                  }}
                  variant="outlined"
                />
              </Box>
              <Box my={2}>
                <SelectInput
                  name="registrationPolicy"
                  label="Registration policy"
                  defaultValue={event.registrationPolicy}
                  inputRef={register}
                  fullWidth
                >
                  <option value="OPEN">Open</option>
                  <option value="REQUEST_TO_JOIN">Request to join</option>
                  <option value="INVITE_ONLY">Invite only</option>
                </SelectInput>
              </Box>
              <Box my={2}>
                <TextField
                  name="info"
                  label="Welcome message info box (markdown allowed)"
                  defaultValue={event.info}
                  fullWidth
                  multiline
                  rows={15}
                  inputRef={register}
                  variant="outlined"
                />
              </Box>
              <Box mt={2}>
                <Button
                  type="submit"
                  size="large"
                  variant="contained"
                  color="primary"
                >
                  Save
                </Button>
              </Box>
            </Box>
          </form>
        </div>
      </Modal>
    </>
  );
};
