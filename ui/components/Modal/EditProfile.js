import useForm from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

import { Box, TextField, Button } from "@material-ui/core";
import Card from "../styled/Card";
import Avatar from "../Avatar";

const UPDATE_CURRENT_MEMBER = gql`
  mutation updateProfile($name: String, $avatar: String) {
    updateProfile(name: $name, avatar: $avatar) {
      id
      name
      avatar
      email
    }
  }
`;

const EditProfile = ({ closeModal, currentMember }) => {
  const [updateUser] = useMutation(UPDATE_CURRENT_MEMBER);
  const { handleSubmit, register, errors } = useForm();

  return (
    <Card>
      <Box p={3}>
        <h1>Edit profile</h1>
        <form
          onSubmit={handleSubmit(variables => {
            updateUser({ variables })
              .then(({ data }) => {
                // console.log({ data });
                closeModal();
              })
              .catch(err => {
                console.log({ err });
                alert(err.message);
              });
          })}
        >
          <Box m="15px 0">
            <TextField
              name="name"
              label="Display name"
              variant="outlined"
              defaultValue={currentMember.name}
              error={errors.name}
              helperText={errors.name && errors.name.message}
              fullWidth
              inputRef={register({
                required: "Required"
              })}
            />
          </Box>

          <Button
            type="submit"
            size="large"
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </form>
      </Box>
    </Card>
  );
};

export default EditProfile;
