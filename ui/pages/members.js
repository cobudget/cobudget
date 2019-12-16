import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import useForm from "react-hook-form";
import styled from "styled-components";

import Card from "../components/styled/Card";
import Form from "../components/styled/Form";

const MEMBERS = gql`
  query Members {
    members {
      id
      name
      email
      avatar
      isAdmin
      isApproved
      verifiedEmail
      createdAt
    }
  }
`;

const INVITE_MEMBERS = gql`
  mutation InviteMembers($emails: String!) {
    inviteMembers(emails: $emails) {
      id
      name
      email
      avatar
      isAdmin
      isApproved
      verifiedEmail
    }
  }
`;

const UPDATE_MEMBER = gql`
  mutation UpdateMember(
    $memberId: ID!
    $isAdmin: Boolean
    $isApproved: Boolean
  ) {
    updateMember(
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

const StyledTable = styled.table`
  border-spacing: 0;
  margin: 30px 0;
  /* //z-indexborder: 1px solid black; */
  width: 100%;
  tr {
    :nth-child(even) {
      background: #f7f8f9;
    }
    :last-child {
      td {
        border-bottom: 0;
      }
    }
  }

  th,
  td {
    margin: 0;
    /* padding: 0.5rem; */
    padding: 0.5rem;
    /* border-bottom: 1px solid black; */
    /* border-right: 1px solid black; */
    text-align: left;
    :last-child {
      border-right: 0;
    }
  }
`;

export default ({ event, currentMember }) => {
  if (!currentMember || !currentMember.isAdmin)
    return <div>This is for admins</div>;

  const { data: { members } = { members: [] }, loading, error } = useQuery(
    MEMBERS
  );

  const [inviteMembers] = useMutation(INVITE_MEMBERS);
  const [updateMember] = useMutation(UPDATE_MEMBER);
  const { handleSubmit, register, errors } = useForm();
  const onSubmit = variables => {
    console.log({ variables });
    inviteMembers({ variables }).then(data => {
      console.log({ data });
    });
  };
  const approvedMembers = members.filter(member => member.isApproved);
  const requestsToJoin = members.filter(
    member => !member.isApproved && member.verifiedEmail
  );
  return (
    <Card>
      {/* <ul>
        <li>Edit event details (name, slug, currency?)</li>
        <li>Edit members (add, approve, make guides/ admins</li>
      </ul> */}
      <h1>Members</h1>
      <ul></ul>
      <StyledTable>
        <tbody>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>isAdmin</th>
            <th>Approved</th>
          </tr>
          {approvedMembers.map(member => (
            <tr key={member.email}>
              <td>{member.name ? member.name : ""}</td>
              <td>
                {member.email} (
                {member.verifiedEmail ? "verified" : "not verified"})
              </td>
              <td>
                {member.isAdmin ? "true" : "false"}{" "}
                <button
                  onClick={() => {
                    updateMember({
                      variables: {
                        memberId: member.id,
                        isAdmin: !member.isAdmin
                      }
                    });
                  }}
                >
                  Toggle admin
                </button>
              </td>
              <td>
                <button
                  onClick={() => {
                    updateMember({
                      variables: { memberId: member.id, isApproved: false }
                    });
                  }}
                >
                  Unapprove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
      {requestsToJoin.length > 0 && (
        <>
          <h2>Requests to join</h2>
          <p>
            This list shows member objects that have verified their email
            (logged in and finished sign up) and are unapproved.
          </p>
          <StyledTable>
            <tbody>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Approve</th>
              </tr>
              {requestsToJoin.map(member => (
                <tr key={member.email}>
                  <td>{member.name ? member.name : ""}</td>
                  <td>
                    {member.email}{" "}
                    {member.verifiedEmail ? "verified" : "not verified"}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        updateMember({
                          variables: { memberId: member.id, isApproved: true }
                        });
                      }}
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </>
      )}

      <h2>Invite members</h2>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <textarea
          type="text"
          name="emails"
          ref={register}
          placeholder="Comma separated emails"
        />{" "}
        <button type="submit">Invite</button>
      </Form>
    </Card>
  );
};

// validate email addresses.. is there a regex for the input? comma separated emails? :)
// what to do on duplicates?

// make guide,
// approve
// make admin
