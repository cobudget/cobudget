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

const Table = styled.table`
  margin: 30px 0;
  width: 100%;
`;

export default ({ event, currentMember }) => {
  console.log({ currentMember });
  if (!currentMember || !currentMember.isAdmin)
    return <div>This is for admins</div>;

  const { data: { members } = { members: null }, loading, error } = useQuery(
    MEMBERS
  );

  const [inviteMembers] = useMutation(INVITE_MEMBERS);
  const { handleSubmit, register, errors } = useForm();
  const onSubmit = variables => {
    console.log({ variables });
    inviteMembers({ variables }).then(data => {
      console.log({ data });
    });
  };
  return (
    <Card>
      {/* <ul>
        <li>Edit event details (name, slug, currency?)</li>
        <li>Edit members (add, approve, make guides/ admins</li>
      </ul> */}
      <h1>Members</h1>
      <ul></ul>
      <Table>
        <tbody>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Verified email (has logged in)</th>
            <th>isAdmin</th>
            <th>isApproved</th>
          </tr>
          {members &&
            members.map(member => (
              <tr key={member.email}>
                <td>{member.name ? member.name : "not set"}</td>
                <td>{member.email}</td>
                <td>{member.verifiedEmail ? "true" : "false"}</td>
                <td>{member.isAdmin ? "true" : "false"}</td>
                <td>{member.isApproved ? "true" : "false"}</td>
              </tr>
            ))}
        </tbody>
      </Table>
      <h2>Invite members</h2>
      Comma separated list of emails to invite
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
