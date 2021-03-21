import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

import HappySpinner from "../../HappySpinner";
import OrgMembersTable from "./OrgMembersTable";

// TODO: this is event members, change to getting org members
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

// // TODO: change to edit org members, not event members
// const UPDATE_MEMBER = gql`
//   mutation UpdateMember(
//     $memberId: ID!
//     $eventId: ID!
//     $isAdmin: Boolean
//     $isApproved: Boolean
//     $isGuide: Boolean
//   ) {
//     updateMember(
//       memberId: $memberId
//       eventId: $eventId
//       isAdmin: $isAdmin
//       isApproved: $isApproved
//       isGuide: $isGuide
//     ) {
//       id
//       isAdmin
//       isApproved
//       isGuide
//     }
//   }
// `;
//
// // TODO: change to deleting org members, not event members
// const DELETE_MEMBER = gql`
//   mutation UpdateMember($memberId: ID!, $eventId: ID!) {
//     deleteMember(memberId: $memberId, eventId: $eventId) {
//       id
//     }
//   }
// `;

export default () => {
  const { data, loading, error } = useQuery(ORG_MEMBERS_QUERY);
  const orgMembers = data?.orgMembers;
  // console.log({ org, orgMembers, error });
  // const [updateMember] = useMutation(UPDATE_MEMBER, {
  //   variables: { eventId: event.id },
  // });

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

      <OrgMembersTable members={orgMembers} />
    </div>
  );
};
