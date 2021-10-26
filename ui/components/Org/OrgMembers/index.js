import { useState } from "react";
import { useQuery, useMutation, gql } from "urql";

import Button from "components/Button";
import InviteMembersModal from "components/InviteMembersModal";

import OrgMembersTable from "./OrgMembersTable";

const UPDATE_ORG_MEMBER = gql`
  mutation UpdateOrgMember($memberId: ID!, $isOrgAdmin: Boolean) {
    updateOrgMember(memberId: $memberId, isOrgAdmin: $isOrgAdmin) {
      id
      isOrgAdmin
    }
  }
`;

// // TODO: change to deleting org members, not event members
// const DELETE_MEMBER = gql`
//   mutation UpdateMember($memberId: ID!, $eventId: ID!) {
//     deleteMember(memberId: $memberId, eventId: $eventId) {
//       id
//     }
//   }
// `;

const OrgMembers = ({ currentOrg }) => {
  const [, updateOrgMember] = useMutation(UPDATE_ORG_MEMBER);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  // const [deleteMember] = useMutation(DELETE_MEMBER, {
  //   variables: { eventId: event.id },
  //   update(cache, { data: { deleteMember } }) {
  //     const { members } = cache.readQuery({
  //       query: MEMBERS_QUERY,
  //       variables: { eventId: event.id },
  //     });

  //     cache.writeQuery({
  //       query: MEMBERS_QUERY,
  //       variables: { eventId: event.id },
  //       data: {
  //         members: members.filter((member) => member.id !== deleteMember.id),
  //       },
  //     });
  //   },
  // });

  return (
    <div>
      <div className="flex justify-between mb-3 items-center">
        <h2 className="text-xl font-semibold">Organization members</h2>{" "}
        <div>
          <Button onClick={() => setInviteModalOpen(true)}>
            Invite members
          </Button>
          {inviteModalOpen && (
            <InviteMembersModal handleClose={() => setInviteModalOpen(false)} />
          )}
        </div>
      </div>

      <OrgMembersTable
        updateOrgMember={updateOrgMember}
        currentOrg={currentOrg}
      />
    </div>
  );
};

export default OrgMembers;
