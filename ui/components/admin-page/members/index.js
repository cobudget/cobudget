import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";

import { Box, Button, Modal } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { makeStyles } from "@material-ui/core/styles";

import HappySpinner from "../../HappySpinner";
import InviteMembersForm from "./InviteMembersForm";
import MembersTable from "./MembersTable";
import RequestsToJoinTable from "./RequestToJoinTable";

export const MEMBERS_QUERY = gql`
  query Members {
    members {
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

const UPDATE_MEMBER = gql`
  mutation UpdateMember(
    $memberId: ID!
    $isAdmin: Boolean
    $isApproved: Boolean
  ) {
    updateMember(
      memberId: $memberId
      isAdmin: $isAdmin
      isApproved: $isApproved
    ) {
      id
      isAdmin
      isApproved
    }
  }
`;

const DELETE_MEMBER = gql`
  mutation UpdateMember($memberId: ID!) {
    deleteMember(memberId: $memberId) {
      id
    }
  }
`;

const useStyles = makeStyles(theme => ({
  modal: {
    display: "flex",
    padding: theme.spacing(1),
    alignItems: "center",
    justifyContent: "center"
  },
  innerModal: {
    flex: "0 1 800px",
    outline: "none"
  }
}));

export default ({}) => {
  const classes = useStyles();

  const { data: { members } = { members: [] }, loading, error } = useQuery(
    MEMBERS_QUERY
  );

  const [updateMember] = useMutation(UPDATE_MEMBER);
  const [deleteMember] = useMutation(DELETE_MEMBER, {
    update(cache, { data: { deleteMember } }) {
      const { members } = cache.readQuery({ query: MEMBERS_QUERY });
      cache.writeQuery({
        query: MEMBERS_QUERY,
        data: {
          members: members.filter(member => member.id !== deleteMember.id)
        }
      });
    }
  });

  const approvedMembers = members.filter(member => member.isApproved);
  const requestsToJoin = members.filter(
    member => !member.isApproved && member.verifiedEmail
  );

  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {loading ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight={400}
        >
          <HappySpinner />
        </Box>
      ) : (
        <>
          <RequestsToJoinTable
            requestsToJoin={requestsToJoin}
            updateMember={updateMember}
            deleteMember={deleteMember}
          />

          <Box p={2} display="flex" justifyContent="space-between">
            <h2 className="text-2xl">{approvedMembers.length} members</h2>{" "}
            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpen}
                startIcon={<AddIcon />}
              >
                Invite members
              </Button>
              <Modal
                open={open}
                onClose={handleClose}
                className={classes.modal}
              >
                <div className={classes.innerModal}>
                  <InviteMembersForm handleClose={handleClose} />
                </div>
              </Modal>
            </div>
          </Box>

          <MembersTable
            approvedMembers={approvedMembers}
            updateMember={updateMember}
            deleteMember={deleteMember}
          />
        </>
      )}
    </>
  );
};
