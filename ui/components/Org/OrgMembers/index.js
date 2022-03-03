import { useState } from "react";
import { useQuery, useMutation, gql } from "urql";

import Button from "components/Button";
import InviteMembersModal from "components/InviteMembersModal";

import OrgMembersTable from "./OrgMembersTable";

const UPDATE_ORG_MEMBER = gql`
  mutation UpdateOrgMember($orgId: ID!, $memberId: ID!, $isAdmin: Boolean) {
    updateOrgMember(orgId: $orgId, memberId: $memberId, isAdmin: $isAdmin) {
      id
      isAdmin
    }
  }
`;

// // TODO: change to deleting org members, not round members
// const DELETE_MEMBER = gql`
//   mutation UpdateMember($memberId: ID!, $collectionId: ID!) {
//     deleteMember(memberId: $memberId, collectionId: $collectionId) {
//       id
//     }
//   }
// `;

const OrgMembers = ({ currentOrg }) => {
  const [, updateOrgMember] = useMutation(UPDATE_ORG_MEMBER);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  // const [deleteMember] = useMutation(DELETE_MEMBER, {
  //   variables: { collectionId: round.id },
  //   update(cache, { data: { deleteMember } }) {
  //     const { members } = cache.readQuery({
  //       query: MEMBERS_QUERY,
  //       variables: { collectionId: round.id },
  //     });

  //     cache.writeQuery({
  //       query: MEMBERS_QUERY,
  //       variables: { collectionId: round.id },
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
            <InviteMembersModal
              currentOrg={currentOrg}
              handleClose={() => setInviteModalOpen(false)}
            />
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
