import { useState } from "react";
import { useQuery, useMutation, gql } from "urql";

import Button from "../Button";
import InviteMembersModal from "../InviteMembersModal";
import LoadMore from "../LoadMore";

import MembersTable from "./MembersTable";
import RequestsToJoinTable from "./RequestToJoinTable";

export const COLLECTION_MEMBERS_QUERY = gql`
  query Members($collectionId: ID!, $offset: Int, $limit: Int) {
    approvedMembersPage: membersPage(
      collectionId: $collectionId
      isApproved: true
      offset: $offset
      limit: $limit
    ) {
      moreExist
      approvedMembers: members(
        collectionId: $collectionId
        isApproved: true
        offset: $offset
        limit: $limit
      ) {
        id
        isAdmin
        isModerator
        isApproved
        createdAt
        balance
        email
        name
        hasJoined
        user {
          id
          username
          verifiedEmail
          avatar
        }
      }
    }
    requestsToJoinPage: membersPage(
      collectionId: $collectionId
      isApproved: false
    ) {
      requestsToJoin: members(collectionId: $collectionId, isApproved: false) {
        id
        isAdmin
        isModerator
        isApproved
        createdAt
        balance
        email
        name
        user {
          id
          username
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
    $collectionId: ID!
    $isAdmin: Boolean
    $isApproved: Boolean
    $isModerator: Boolean
  ) {
    updateMember(
      memberId: $memberId
      collectionId: $collectionId
      isAdmin: $isAdmin
      isApproved: $isApproved
      isModerator: $isModerator
    ) {
      id
      isAdmin
      isApproved
      isModerator
    }
  }
`;

const DELETE_MEMBER = gql`
  mutation DeleteMember($memberId: ID!, $collectionId: ID!) {
    deleteMember(memberId: $memberId, collectionId: $collectionId) {
      id
    }
  }
`;

const EventMembers = ({ collection, currentUser }) => {
  const [
    {
      data: {
        approvedMembersPage: { moreExist, approvedMembers } = {
          moreExist: false,
          approvedMembers: [],
        },
        requestsToJoinPage: { requestsToJoin },
      } = {
        approvedMembersPage: {
          approvedMembers: [],
        },
        requestsToJoinPage: {
          requestsToJoin: [],
        },
      },
      fetching: loading,
      error,
    },
  ] = useQuery({
    query: COLLECTION_MEMBERS_QUERY,
    variables: { collectionId: collection.id, offset: 0, limit: 1000 },
  });

  const [, updateMember] = useMutation(UPDATE_MEMBER);

  const [, deleteMember] = useMutation(DELETE_MEMBER);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const isAdmin =
    currentUser?.currentOrgMember?.isAdmin ||
    currentUser?.currentCollMember?.isAdmin;

  if (error) {
    console.error(error);
    return null;
  }

  return (
    <>
      <div className="page">
        <RequestsToJoinTable
          requestsToJoin={requestsToJoin}
          updateMember={updateMember}
          deleteMember={deleteMember}
          collection={collection}
        />

        <div className="flex justify-between mb-3 items-center">
          <h2 className="text-xl font-semibold">All collection members</h2>
          {isAdmin && (
            <div className="flex items-center space-x-2">
              <Button onClick={() => setInviteModalOpen(true)}>
                Invite members
              </Button>
              {inviteModalOpen && (
                <InviteMembersModal
                  handleClose={() => setInviteModalOpen(false)}
                  collectionId={collection.id}
                />
              )}
            </div>
          )}
        </div>

        <MembersTable
          approvedMembers={approvedMembers}
          updateMember={updateMember}
          deleteMember={deleteMember}
          collection={collection}
          isAdmin={isAdmin}
        />
        {/* TODO:fix */}
        <LoadMore
          moreExist={moreExist}
          loading={loading}
          onClick={
            () => {}
            //fetchMore({ variables: { offset: approvedMembers.length } })
          }
        />
      </div>
    </>
  );
};

export default EventMembers;
