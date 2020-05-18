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
  query Members($eventId: ID!) {
    members(eventId: $eventId) {
      id
      isAdmin
      isGuide
      isApproved
      createdAt
      user {
        id
        name
        email
        verifiedEmail
        avatar
      }
    }
  }
`;

const UPDATE_MEMBER = gql`
  mutation UpdateMember(
    $memberId: ID!
    $eventId: ID!
    $isAdmin: Boolean
    $isApproved: Boolean
    $isGuide: Boolean
  ) {
    updateMember(
      memberId: $memberId
      eventId: $eventId
      isAdmin: $isAdmin
      isApproved: $isApproved
      isGuide: $isGuide
    ) {
      id
      isAdmin
      isApproved
      isGuide
    }
  }
`;

const DELETE_MEMBER = gql`
  mutation UpdateMember($memberId: ID!, $eventId: ID!) {
    deleteMember(memberId: $memberId, eventId: $eventId) {
      id
    }
  }
`;

export default ({ event }) => {
  const {
    data: { members } = { members: [] },
    loading,
    error,
  } = useQuery(MEMBERS_QUERY, { variables: { eventId: event.id } });

  const [updateMember] = useMutation(UPDATE_MEMBER, {
    variables: { eventId: event.id },
  });

  const [deleteMember] = useMutation(DELETE_MEMBER, {
    variables: { eventId: event.id },
    update(cache, { data: { deleteMember } }) {
      const { members } = cache.readQuery({
        query: MEMBERS_QUERY,
        variables: { eventId: event.id },
      });

      cache.writeQuery({
        query: MEMBERS_QUERY,
        variables: { eventId: event.id },
        data: {
          members: members.filter((member) => member.id !== deleteMember.id),
        },
      });
    },
  });

  //console.log({ members });

  const approvedMembers = members.filter((member) => member.isApproved);
  const requestsToJoin = members.filter(
    (member) => !member.isApproved && member.verifiedEmail
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
            {/* <div>
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
            </div> */}
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
