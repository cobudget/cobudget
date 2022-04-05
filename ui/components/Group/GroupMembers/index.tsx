import { useState } from "react";
import { useMutation, gql } from "urql";

import Button from "components/Button";
import InviteMembersModal from "components/InviteMembersModal";

import GroupMembersTable from "./GroupMembersTable";

const UPDATE_GROUP_MEMBER = gql`
  mutation UpdateGroupMember($groupId: ID!, $memberId: ID!, $isAdmin: Boolean) {
    updateGroupMember(
      groupId: $groupId
      memberId: $memberId
      isAdmin: $isAdmin
    ) {
      id
      isAdmin
    }
  }
`;

const DELETE_GROUP_MEMBER = gql`
  mutation DeleteGroupMember($groupMemberId: ID!) {
    deleteGroupMember(groupMemberId: $groupMemberId) {
      id
    }
  }
`;

const GroupMembers = ({}) => {
  const [, updateGroupMember] = useMutation(UPDATE_GROUP_MEMBER);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [, deleteGroupMember] = useMutation(DELETE_GROUP_MEMBER);

  return (
    <div>
      <div className="flex justify-between mb-3 items-center">
        <h2 className="text-xl font-semibold">Group members</h2>{" "}
        <div>
          <Button onClick={() => setInviteModalOpen(true)}>
            Invite members
          </Button>
          {inviteModalOpen && (
            <InviteMembersModal
              currentGroup={currentGroup} // it needs groupId (or could rewrite the mutation to use groupSlug)
              handleClose={() => setInviteModalOpen(false)}
            />
          )}
        </div>
      </div>

      <GroupMembersTable
        updateGroupMember={updateGroupMember}
        deleteGroupMember={deleteGroupMember}
        currentGroup={currentGroup} // it needs groupId (or could rewrite the query to use groupSlug)
      />
    </div>
  );
};

export default GroupMembers;
