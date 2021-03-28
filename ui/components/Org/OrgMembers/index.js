import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";

import HappySpinner from "../../HappySpinner";
import OrgMembersTable from "./OrgMembersTable";

export const ORG_MEMBERS_QUERY = gql`
  query OrgMembers {
    orgMembers {
      id
      isOrgAdmin
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
`;

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

const OrgMembers = () => {
  const { data, loading, error } = useQuery(ORG_MEMBERS_QUERY);
  const orgMembers = data?.orgMembers;
  const [updateOrgMember] = useMutation(UPDATE_ORG_MEMBER);

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

  if (error) {
    console.error(error);
    return null;
  }
  if (loading)
    return (
      <div className="flex-grow flex justify-center items-center">
        <HappySpinner />
      </div>
    );

  return (
    <div>
      <div className="flex justify-between">
        <h2 className="text-xl mb-3">{orgMembers.length} members</h2>
      </div>

      <OrgMembersTable members={orgMembers} updateOrgMember={updateOrgMember} />
    </div>
  );
};

export default OrgMembers;
