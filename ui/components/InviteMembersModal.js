import { useMutation, gql } from "urql";
import { useForm } from "react-hook-form";

import { Modal } from "@material-ui/core";

import TextField from "components/TextField";
import Button from "components/Button";
import Banner from "components/Banner";

const INVITE_ORG_MEMBERS_MUTATION = gql`
  mutation InviteOrgMembers($orgId: ID!, $emails: String!) {
    inviteOrgMembers(orgId: $orgId, emails: $emails) {
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

const INVITE_EVENT_MEMBERS_MUTATION = gql`
  mutation InviteEventMembers($emails: String!, $eventId: ID!) {
    inviteEventMembers(emails: $emails, eventId: $eventId) {
      id
      isAdmin
      isGuide
      isApproved
      createdAt
      orgMember {
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
  }
`;

const InviteMembersModal = ({ handleClose, eventId, currentOrg }) => {
  const { handleSubmit, register, errors, reset } = useForm();
  const [{ fetching: loading, error }, inviteMembers] = useMutation(
    eventId ? INVITE_EVENT_MEMBERS_MUTATION : INVITE_ORG_MEMBERS_MUTATION
  );

  return (
    <>
      <Modal
        open={true}
        onClose={handleClose}
        className="flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-sm">
          <h1 className="text-xl font-semibold mb-2">
            Invite {eventId ? "event " : ""}members
          </h1>
          <Banner
            className={"mb-4"}
            variant="warning"
            title={`This feature is in beta, please note: `}
          >
            <ul className="list-disc ml-5">
              <li className="mt-2">
                This is currently more of a quick way of adding people as
                members of the organization and/or event, rather than a proper
                invite functionality.
              </li>
              <li className="mt-2">
                People added here should be expecting to be added to the
                platform.
              </li>
              <li className="mt-2">
                People without Cobudget accounts will get an anonymous
                &quot;Welcome to Cobudget&quot; email to complete their signup.
              </li>
              <li className="mt-2">
                People with Cobudget accounts will get no notification or email.
              </li>
            </ul>
          </Banner>
          <form
            onSubmit={handleSubmit((variables) => {
              inviteMembers({
                ...variables,
                ...(eventId ? { eventId } : { orgId: currentOrg.id }),
              })
                .then(() => {
                  reset();
                  handleClose();
                })
                .catch((err) => {
                  alert(err.message);
                });
            })}
          >
            <TextField
              placeholder="Comma separated emails"
              multiline
              rows="4"
              name="emails"
              autoFocus
              error={Boolean(errors.emails)}
              helperText={errors.emails && errors.emails.message}
              inputRef={register({
                required: "Required",
                pattern: {
                  value: /^[\W]*([\w+\-.%]+@[\w\-.]+\.[A-Za-z]+[\W]*,{1}[\W]*)*([\w+\-.%]+@[\w\-.]+\.[A-Za-z]+)[\W]*$/,
                  message: "Need to be a comma separated list of emails",
                },
              })}
            />
            <div className="flex justify-end mt-4">
              <Button
                className="mr-2"
                variant="secondary"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Add people
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default InviteMembersModal;
