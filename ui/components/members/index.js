import React from "react";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";

import Button from "components/Button";
import HappySpinner from "components/HappySpinner";
import InviteMembersModal from "components/InviteMembersModal";

import MembersTable from "./MembersTable";
import RequestsToJoinTable from "./RequestToJoinTable";

export const EVENT_MEMBERS_QUERY = gql`
  query Members($eventId: ID!) {
    members(eventId: $eventId) {
      id
      isAdmin
      isGuide
      isApproved
      createdAt
      balance
      orgMember {
        bio
        user {
          id
          name
          username
          email
          verifiedEmail
          avatar
        }
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

const EventMembers = ({ event }) => {
  const {
    data: { members } = { members: [] },
    loading,
    error,
  } = useQuery(EVENT_MEMBERS_QUERY, { variables: { eventId: event.id } });

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

  const approvedMembers = members.filter((member) => member.isApproved);
  const requestsToJoin = members.filter((member) => !member.isApproved);

  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);

  if (loading)
    return (
      <div className="flex-grow flex justify-center items-center">
        <HappySpinner />
      </div>
    );

  return (
    <>
      <RequestsToJoinTable
        requestsToJoin={requestsToJoin}
        updateMember={updateMember}
        deleteMember={deleteMember}
      />

      <div className="flex justify-between mb-3 items-center">
        <h2 className="text-xl font-semibold">
          {approvedMembers.length} members
        </h2>
        <div>
          <Button onClick={() => setInviteModalOpen(true)}>
            Invite members
          </Button>
          {inviteModalOpen && (
            <InviteMembersModal
              handleClose={() => setInviteModalOpen(false)}
              eventId={event.id}
            />
          )}
        </div>
      </div>

      <MembersTable
        approvedMembers={approvedMembers}
        updateMember={updateMember}
        deleteMember={deleteMember}
        event={event}
      />
    </>
  );
};

export default EventMembers;
