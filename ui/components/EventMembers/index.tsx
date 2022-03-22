import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, gql } from "urql";
import { debounce } from "lodash";

import Button from "../Button";
import InviteMembersModal from "../InviteMembersModal";
import LoadMore from "../LoadMore";
import MembersTable from "./MembersTable";
import RequestsToJoinTable from "./RequestToJoinTable";
import SearchBar from "components/EventMembers/SearchBar";
import Router from 'next/router'

export const COLLECTION_MEMBERS_QUERY = gql`
  query Members(
    $collectionId: ID!
    $search: String!
    $offset: Int
    $limit: Int
  ) {
    approvedMembersPage: membersPage(
      collectionId: $collectionId
      isApproved: true
      search: $search
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
        hasJoined
        user {
          id
          username
          name
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
        user {
          id
          username
          name
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
  const [searchString, setSearchString] = useState("");
  const [
    {
      data,
      fetching: loading,
      error,
    },
    searchApprovedMembers,
  ] = useQuery({
    query: COLLECTION_MEMBERS_QUERY,
    variables: {
      collectionId: collection.id,
      search: searchString,
      offset: 0,
      limit: 1000,
    },
    pause: true,
  });

  const approvedMembers = data?.approvedMembersPage?.approvedMembers || [];
  const moreExist = data?.approvedMembersPage?.moreExist || false;
  const requestsToJoin = data?.requestsToJoinPage?.requestsToJoin || [];

  const debouncedSearchMembers = useMemo(() => {
    return debounce(searchApprovedMembers, 300, { leading: true });
  }, [searchApprovedMembers]);

  const items = useMemo(() => {
    if (loading || !approvedMembers) {
      return [];
    }
    return approvedMembers;
  }, [approvedMembers, loading]);

  useEffect(() => {
    debouncedSearchMembers();
  }, [debouncedSearchMembers]);

  const [, updateMember] = useMutation(UPDATE_MEMBER);

  const [{ fetching:deleteMemberLoading, data: deleteMemberResponse }, deleteMember] = useMutation(DELETE_MEMBER);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const isAdmin =
    currentUser?.currentOrgMember?.isAdmin ||
    currentUser?.currentCollMember?.isAdmin;

  useEffect(() => {
    const member = approvedMembers.find(_member => {
      return _member.id === deleteMemberResponse?.deleteMember.id
    });
    
    if (!deleteMemberLoading && (currentUser.id === member?.user?.id)) {
      Router.reload();
    }

    console.log(deleteMemberResponse, currentUser);
  }, [deleteMemberLoading]);

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
          <SearchBar
            collection={collection}
            value={searchString}
            placeholder="Search members"
            onChange={(e) => setSearchString(e.target.value)}
            clearInput={() => setSearchString("")}
          />
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
          approvedMembers={items}
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
