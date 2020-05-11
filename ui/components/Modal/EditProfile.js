import useForm from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

import { TextField, Button } from "@material-ui/core";
import Card from "../styled/Card";

const UPDATE_PROFILE_QUERY = gql`
  mutation updateProfile($name: String, $avatar: String) {
    updateProfile(name: $name, avatar: $avatar) {
      id
      name
      avatar
      email
    }
  }
`;

const EditProfile = ({ closeModal, currentUser }) => {
  const [updateUser] = useMutation(UPDATE_PROFILE_QUERY);
  const { handleSubmit, register, errors } = useForm();

  return (
    <Card>
      <div className="p-5">
        <h1 className="text-2xl">Edit profile</h1>
        <form
          onSubmit={handleSubmit((variables) => {
            updateUser({ variables })
              .then(({ data }) => {
                // console.log({ data });
                closeModal();
              })
              .catch((err) => {
                console.log({ err });
                alert(err.message);
              });
          })}
        >
          <div className="my-4">
            <TextField
              name="name"
              label="Display name"
              variant="outlined"
              defaultValue={currentUser.name}
              error={Boolean(errors.name)}
              helperText={errors.name && errors.name.message}
              fullWidth
              inputRef={register({
                required: "Required",
              })}
            />
          </div>

          <Button
            type="submit"
            size="large"
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default EditProfile;
