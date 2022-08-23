import { useState } from "react";
import { useMutation, gql } from "urql";

import Button from "components/Button";
import InviteMembersModal from "components/InviteMembersModal";

import GroupMembersTable from "./GroupMembersTable";
import SearchBar from "../../RoundMembers/SearchBar";
import { FormattedMessage, useIntl } from "react-intl";
import RequestToJoinGroup from "./RequestToJoinGroup";

const UPDATE_GROUP_MEMBER = gql`
  mutation UpdateGroupMember(
    $groupId: ID!
    $memberId: ID!
    $isAdmin: Boolean
    $isApproved: Boolean
  ) {
    updateGroupMember(
      groupId: $groupId
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

const DELETE_GROUP_MEMBER = gql`
  mutation DeleteGroupMember($groupId: ID!, $groupMemberId: ID!) {
    deleteGroupMember(groupId: $groupId, groupMemberId: $groupMemberId) {
      id
    }
  }
`;

const GroupMembers = ({ currentGroup }) => {
  const [searchString, setSearchString] = useState("");
  const [, updateGroupMember] = useMutation(UPDATE_GROUP_MEMBER);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [, deleteGroupMember] = useMutation(DELETE_GROUP_MEMBER);
  const intl = useIntl();
  return (
    <div>
      <RequestToJoinGroup
        currentGroup={currentGroup}
        deleteMember={deleteGroupMember}
        updateMember={updateGroupMember}
      />
      <div className="flex justify-between mb-3 items-center">
        <SearchBar
          color={"anthracit"}
          value={searchString}
          placeholder={intl.formatMessage({
            defaultMessage: "Search members",
          })}
          onChange={(e) => setSearchString(e.target.value)}
          clearInput={() => setSearchString("")}
        />
        <div>
          <Button onClick={() => setInviteModalOpen(true)}>
            <FormattedMessage defaultMessage="Invite members" />
          </Button>
          {inviteModalOpen && (
            <InviteMembersModal
              currentGroup={currentGroup}
              handleClose={() => setInviteModalOpen(false)}
            />
          )}
        </div>
      </div>

      <GroupMembersTable
        updateGroupMember={updateGroupMember}
        deleteGroupMember={deleteGroupMember}
        currentGroup={currentGroup}
        searchString={searchString}
      />
    </div>
  );
};

export default GroupMembers;
