import { useForm } from "react-hook-form";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";

import { Box, TextField, Button } from "@material-ui/core";
import Card from "../styled/Card";

const UPDATE_CURRENT_USER = gql`
  mutation updateProfile($name: String, $avatar: String, $bio: String) {
    updateProfile(name: $name, avatar: $avatar, bio: $bio) {
      id
      name
      avatar
      bio
      email
    }
  }
`;

const FinishSignUp = ({ closeModal }) => {
  const [updateUser] = useMutation(UPDATE_CURRENT_USER);
  const { handleSubmit, register, errors } = useForm();

  return (
    <Card>
      <Box p={3}>
        <h1 className="text-2xl mb-2">Finish sign up!</h1>
        <h2>Please choose your display name</h2>
        {/* 
          <p>
            If event.RegistrationPolicy === request to join. Set your name, and
            you will then be on the list of requested to join
          </p> */}

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
          <Box m="15px 0">
            <TextField
              name="name"
              label="Display name"
              variant="outlined"
              error={errors.name}
              helperText={errors.name && errors.name.message}
              fullWidth
              inputRef={register({
                required: "Required",
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

export default FinishSignUp;
