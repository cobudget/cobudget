import { useForm } from "react-hook-form";
import { useMutation, gql } from "urql";
import toast from "react-hot-toast";
import { TextField, Button } from "@material-ui/core";
import Card from "../styled/Card";
import dirtyValues from "utils/dirtyValues";
import { FormattedMessage, useIntl } from "react-intl";

const UPDATE_PROFILE_QUERY = gql`
  mutation updateProfile($username: String, $name: String) {
    updateProfile(username: $username, name: $name) {
      id
      email
      avatar
      username
      name
    }
  }
`;

const EditProfile = ({ closeModal, currentUser }) => {
  const [, updateUser] = useMutation(UPDATE_PROFILE_QUERY);
  const intl = useIntl();
  const {
    handleSubmit,
    register,
    errors,
    formState: { isDirty, dirtyFields },
  } = useForm();
  return (
    <Card>
      <div className="p-5">
        <h1 className="text-2xl">
          <FormattedMessage defaultMessage="Edit profile" />
        </h1>
        <form
          onSubmit={handleSubmit((variables) => {
            if (isDirty) {
              updateUser({
                ...dirtyValues(dirtyFields, variables),
              }).then(({ error }) => {
                if (error) {
                  toast.error(error.message);
                } else {
                  closeModal();
                }
              });
            } else {
              closeModal();
            }
          })}
        >
          <div className="my-4">
            <TextField
              name="name"
              label={ intl.formatMessage({ defaultMessage: "Name" })}
              variant="outlined"
              defaultValue={currentUser.name}
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              fullWidth
              inputRef={register({
                required: "Required",
              })}
            />
          </div>

          <div className="my-4">
            <TextField
              name="username"
              label={ intl.formatMessage({ defaultMessage: "Username" })}
              variant="outlined"
              defaultValue={currentUser.username}
              error={Boolean(errors.username)}
              helperText={errors.username?.message}
              fullWidth
              inputRef={register({
                required: "Required",
              })}
            />
          </div>
          {/* {currentUser.currentGroupMember && (
            <div className="my-4">
              <TextField
                name="bio"
                label={`Bio for ${currentGroup.name}`}
                multiline
                rows={5}
                variant="outlined"
                defaultValue={currentUser.currentGroupMember.bio}
                error={Boolean(errors.bio)}
                helperText={errors.bio && errors.bio.message}
                fullWidth
                inputRef={register()}
              />
            </div>
          )} */}
          <div className="space-x-2 flex">
            <Button
              size="large"
              variant="contained"
              // color="secondary"
              onClick={closeModal}
            >
              <FormattedMessage defaultMessage="Cancel" />
            </Button>
            <Button
              type="submit"
              size="large"
              variant="contained"
              color="primary"
            >
              <FormattedMessage defaultMessage="Save" />
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default EditProfile;
