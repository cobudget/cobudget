import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { useForm } from "react-hook-form";

import Card from "../styled/Card";
import { Box, Button, TextField, Typography } from "@material-ui/core";

import { MEMBERS_QUERY } from ".";
const INVITE_MEMBERS = gql`
  mutation InviteMembers($emails: String!) {
    inviteMembers(emails: $emails) {
      id
      name
      email
      avatar
      isAdmin
      isApproved
      verifiedEmail
      createdAt
    }
  }
`;

export default ({ handleClose }) => {
  const { handleSubmit, register, errors, reset } = useForm();

  const [inviteMembers] = useMutation(INVITE_MEMBERS, {
    update(cache, { data: { inviteMembers } }) {
      const { members } = cache.readQuery({ query: MEMBERS_QUERY });
      cache.writeQuery({
        query: MEMBERS_QUERY,
        data: { members: members.concat(inviteMembers) },
      });
    },
  });

  return (
    <Card>
      <Box p={3}>
        <Typography variant="h5">Invite members</Typography>
        <form
          onSubmit={handleSubmit((variables) => {
            inviteMembers({ variables }).then((data) => {
              reset();
              handleClose();
            });
          })}
        >
          <Box m="15px 0">
            <TextField
              id="outlined-multiline-flexible"
              label="Comma separated emails"
              multiline
              fullWidth
              rows="4"
              name="emails"
              error={Boolean(errors.emails)}
              helperText={errors.emails && errors.emails.message}
              variant="outlined"
              inputRef={register({
                required: "Required",
                pattern: {
                  value: /^[\W]*([\w+\-.%]+@[\w\-.]+\.[A-Za-z]+[\W]*,{1}[\W]*)*([\w+\-.%]+@[\w\-.]+\.[A-Za-z]+)[\W]*$/,
                  message: "Need to be a comma separated list of emails",
                },
              })}
            />
          </Box>

          <Button
            size="large"
            variant="contained"
            color="primary"
            type="submit"
          >
            Send invites
          </Button>
        </form>
      </Box>
    </Card>
  );
};
