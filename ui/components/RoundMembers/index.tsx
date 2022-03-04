import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, gql } from "urql";
import { debounce } from "lodash";

import Button from "../Button";
import InviteMembersModal from "../InviteMembersModal";
import LoadMore from "../LoadMore";
import MembersTable from "./MembersTable";
import RequestsToJoinTable from "./RequestToJoinTable";
import SearchBar from "components/RoundMembers/SearchBar";

export const ROUND_MEMBERS_QUERY = gql`
  query Members(
    $roundId: ID!
    $search: String!
    $offset: Int
    $limit: Int
  ) {
    approvedMembersPage: membersPage(
      roundId: $roundId
      isApproved: true
      search: $search
      offset: $offset
      limit: $limit
    ) {
      moreExist
      approvedMembers: members(
        roundId: $roundId
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
      roundId: $roundId
      isApproved: false
    ) {
      requestsToJoin: members(roundId: $roundId, isApproved: false) {
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
    $roundId: ID!
    $isAdmin: Boolean
    $isApproved: Boolean
    $isModerator: Boolean
  ) {
    updateMember(
      memberId: $memberId
      roundId: $roundId
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
  mutation DeleteMember($memberId: ID!, $roundId: ID!) {
    deleteMember(memberId: $memberId, roundId: $roundId) {
      id
    }
  }
`;

const RoundMembers = ({ round, currentUser }) => {
  const [searchString, setSearchString] = useState("");
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
    searchApprovedMembers,
  ] = useQuery({
    query: ROUND_MEMBERS_QUERY,
    variables: {
      roundId: round.id,
      search: searchString,
      offset: 0,
      limit: 1000,
    },
    pause: true,
  });

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

  const [, deleteMember] = useMutation(DELETE_MEMBER);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const isAdmin =
    currentUser?.currentGroupMember?.isAdmin ||
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
          round={round}
        />

        <div className="flex justify-between mb-3 items-center">
          <SearchBar
            round={round}
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
                  roundId={round.id}
                />
              )}
            </div>
          )}
        </div>

        <MembersTable
          approvedMembers={items}
          updateMember={updateMember}
          deleteMember={deleteMember}
          round={round}
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

export default RoundMembers;
