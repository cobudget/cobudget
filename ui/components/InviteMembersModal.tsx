import { useMutation, gql, useQuery } from "urql";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

import { Modal } from "@material-ui/core";

import TextField from "components/TextField";
import Button from "components/Button";
import Banner from "components/Banner";
import { DeleteIcon } from "components/Icons";
import IconButton from "components/IconButton";
import styled from "styled-components";

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: 80px calc(100% - 130px) 50px;
  background: rgba(243, 244, 246, 1);
  border-radius: 0.375rem;
`;

const INVITE_GROUP_MEMBERS_MUTATION = gql`
  mutation InviteGroupMembers($groupId: ID!, $emails: String!) {
    inviteGroupMembers(groupId: $groupId, emails: $emails) {
      id
      isAdmin
      bio
      name
      email
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

const ROUND_INVITE_LINK = gql`
  query RoundInvitationLink($roundId: ID!) {
    roundInvitationLink (roundId: $roundId) {
      link
    }
  }
`;

const CREATE_ROUND_INVITE_LINK = gql`
  mutation CreateRoundInvitationLink($roundId: ID!) {
    createRoundInvitationLink (roundId: $roundId) {
      link
    }
  }
`;

const DELETE_ROUND_INVITE_LINK = gql`
  mutation DeleteRoundInvitationLink($roundId: ID!) {
    deleteRoundInvitationLink (roundId: $roundId) {
      link
    }
  }
`;

export const INVITE_ROUND_MEMBERS_MUTATION = gql`
  mutation InviteRoundMembers($emails: String!, $roundId: ID!) {
    inviteRoundMembers(emails: $emails, roundId: $roundId) {
      id
      isAdmin
      isModerator
      isApproved
      createdAt
      balance
      email
      name
      user {
        id
        username
        verifiedEmail
        avatar
      }
    }
  }
`;

const InviteMembersModal = ({
  handleClose,
  roundId,
  currentGroup,
}: {
  handleClose: () => void;
  roundId?: string;
  currentGroup?: any;
}) => {
  const { handleSubmit, register, errors, reset } = useForm();
  const [{ fetching: loading, error }, inviteMembers] = useMutation(
    roundId ? INVITE_ROUND_MEMBERS_MUTATION : INVITE_GROUP_MEMBERS_MUTATION
  );
  const [{ data: inviteLink }] = useQuery({
    query: ROUND_INVITE_LINK,
    variables: { roundId }
  });
  const [{ fetching: createInviteLoading }, createInviteLink] = useMutation(CREATE_ROUND_INVITE_LINK);
  const [{ fetching: deleteInviteLoading }, deleteInviteLink] = useMutation(DELETE_ROUND_INVITE_LINK);

  const link = inviteLink?.roundInvitationLink?.link;

  return (
    <>
      <Modal
        open={true}
        onClose={handleClose}
        className="flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-sm">
          <h1 className="text-xl font-semibold mb-2">
            Invite participants {roundId ? " to this round" : ""}
          </h1>
          {/*
          <Banner
            className={"mb-4"}
            variant="warning"
            title={`This feature is in beta, please note: `}
          >
            <ul className="list-disc ml-5">
              <li className="mt-2">
                This is currently more of a quick way of adding people as
                members of the group and/or round, rather than a
                proper invite functionality.
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
          */}
          <form
            onSubmit={handleSubmit((variables) => {
              inviteMembers({
                ...variables,
                ...(roundId ? { roundId } : { groupId: currentGroup.id }),
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
              rows={4}
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
            {link && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-1 block">
                  Anyone with this link will be able to join your round
                </p>
                <GridWrapper>
                  <p
                    className="mt-4 ml-4 text-sm font-medium"
                    onClick={() => {
                      navigator.clipboard
                        .writeText(link)
                        .then(() => window.alert("Copied"));
                    }}
                  >
                    Copy
                  </p>
                  <TextField
                    inputProps={{
                      disabled: true,
                      value: link,
                    }}
                  />
                  <span className="mt-2 ml-2">
                    <IconButton
                      onClick={() => {
                        deleteInviteLink({
                          roundId
                        })
                      }}
                    >
                      <DeleteIcon className="h-5 w-5" />
                    </IconButton>
                  </span>
                </GridWrapper>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <Button
                className="mr-2"
                variant="secondary"
                onClick={handleClose}
              >
                Close
              </Button>
              <Button 
                className="mr-2"
                loading={loading}
                onClick={() => {
                  createInviteLink({
                    roundId
                  })
                }}
              >
                Create Invite Link
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
