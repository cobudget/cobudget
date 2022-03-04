import { useState } from "react";
import { useQuery, useMutation, gql } from "urql";

import Button from "components/Button";
import InviteMembersModal from "components/InviteMembersModal";

import GroupMembersTable from "./GroupMembersTable";

const UPDATE_GROUP_MEMBER = gql`
  mutation UpdateGroupMember($groupId: ID!, $memberId: ID!, $isAdmin: Boolean) {
    updateGroupMember(groupId: $groupId, memberId: $memberId, isAdmin: $isAdmin) {
      id
      isAdmin
    }
  }
`;

// // TODO: change to deleting group members, not round members
// const DELETE_MEMBER = gql`
//   mutation UpdateMember($memberId: ID!, $roundId: ID!) {
//     deleteMember(memberId: $memberId, roundId: $roundId) {
//       id
//     }
//   }
// `;

const GroupMembers = ({ currentGroup }) => {
  const [, updateGroupMember] = useMutation(UPDATE_GROUP_MEMBER);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  // const [deleteMember] = useMutation(DELETE_MEMBER, {
  //   variables: { roundId: round.id },
  //   update(cache, { data: { deleteMember } }) {
  //     const { members } = cache.readQuery({
  //       query: MEMBERS_QUERY,
  //       variables: { roundId: round.id },
  //     });

  //     cache.writeQuery({
  //       query: MEMBERS_QUERY,
  //       variables: { roundId: round.id },
  //       data: {
  //         members: members.filter((member) => member.id !== deleteMember.id),
  //       },
  //     });
  //   },
  // });

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
              currentGroup={currentGroup}
              handleClose={() => setInviteModalOpen(false)}
            />
          )}
        </div>
      </div>

      <GroupMembersTable
        updateGroupMember={updateGroupMember}
        currentGroup={currentGroup}
      />
    </div>
  );
};

export default GroupMembers;
