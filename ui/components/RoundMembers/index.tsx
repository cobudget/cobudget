import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, gql } from "urql";
import { debounce } from "lodash";

import Button from "../Button";
import InviteMembersModal from "../InviteMembersModal";
import LoadMore from "../LoadMore";
import MembersTable from "./MembersTable";
import RequestsToJoinTable from "./RequestToJoinTable";
import SearchBar from "components/RoundMembers/SearchBar";
import { FormattedMessage, useIntl, FormattedNumber } from "react-intl";

export const REQUESTS_TO_JOIN_QUERY = gql`
  query Members($roundId: ID!) {
    requestsToJoinPage: membersPage(roundId: $roundId, isApproved: false) {
      requestsToJoin: members(roundId: $roundId, isApproved: false) {
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
      user {
        id
      }
    }
  }
`;

const RoundMembers = ({ round, currentUser }) => {
  const [{ data, fetching: loading, error }] = useQuery({
    query: REQUESTS_TO_JOIN_QUERY,
    variables: {
      roundId: round.id,
      offset: 0,
      limit: 1000,
    },
  });

  const intl = useIntl();
  const requestsToJoin = data?.requestsToJoinPage?.requestsToJoin || [];

  const [searchString, setSearchString] = useState("");

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
        {requestsToJoin.length > 0 && (
          <RequestsToJoinTable
            requestsToJoin={requestsToJoin}
            updateMember={updateMember}
            deleteMember={deleteMember}
            roundId={round.id}
          />
        )}

        <div className="flex justify-between mb-3 items-center">
          <SearchBar
            color={round.color}
            value={searchString}
            placeholder={intl.formatMessage({
              defaultMessage: "Search participants",
            })}
            onChange={(e) => setSearchString(e.target.value)}
            clearInput={() => setSearchString("")}
          />
          {isAdmin && (
            <div className="flex items-center space-x-2">
              <Button onClick={() => setInviteModalOpen(true)}>
                <FormattedMessage defaultMessage="Invite participants" />
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
          updateMember={updateMember}
          deleteMember={deleteMember}
          round={round}
          isAdmin={isAdmin}
          searchString={searchString}
        />
      </div>
    </>
  );
};

export default RoundMembers;
