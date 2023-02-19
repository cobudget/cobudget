import { useMutation, gql, useQuery } from "urql";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";

import { Modal } from "@material-ui/core";

import TextField from "components/TextField";
import Button from "components/Button";
import Banner from "components/Banner";
import { DeleteIcon } from "components/Icons";
import IconButton from "components/IconButton";
import styled from "styled-components";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";
import { extractEmail } from "utils/url";
import { SEARCH_MENTIONS_GROUP_MEMBERS_QUERY } from "./Wysiwyg";
import { appLink } from "utils/internalLinks";

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: 50px calc(100% - 130px) 80px;
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
  query InvitationLink($roundId: ID!) {
    invitationLink(roundId: $roundId) {
      link
    }
  }
`;

const GROUP_INVITE_LINK = gql`
  query GroupInvitationLink($groupId: ID!) {
    groupInvitationLink(groupId: $groupId) {
      link
    }
  }
`;

const CREATE_ROUND_INVITE_LINK = gql`
  mutation CreateInvitationLink($roundId: ID!) {
    createInvitationLink(roundId: $roundId) {
      link
    }
  }
`;

const CREATE_GROUP_INVITE_LINK = gql`
  mutation CreateGroupInvitationLink($groupId: ID!) {
    createGroupInvitationLink(groupId: $groupId) {
      link
    }
  }
`;

const DELETE_ROUND_INVITE_LINK = gql`
  mutation DeleteInvitationLink($roundId: ID!) {
    deleteInvitationLink(roundId: $roundId) {
      link
    }
  }
`;

const DELETE_GROUP_INVITE_LINK = gql`
  mutation DeleteGroupInvitationLink($groupId: ID!) {
    deleteGroupInvitationLink(groupId: $groupId) {
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
  roundGroup,
}: {
  handleClose: () => void;
  roundId?: string;
  currentGroup?: any;
  roundGroup?: any;
}) => {
  const { handleSubmit, register, errors, reset } = useForm();
  const [groupMembers, fetchGroupMembers] = useQuery({
    query: SEARCH_MENTIONS_GROUP_MEMBERS_QUERY,
    pause: true,
    variables: {
      groupId: roundGroup?.id,
      isApproved: true,
      search: "",
    },
  });
  const [emails, setEmails] = useState("");

  // updatingEmails is used to implement a hack
  // Wysiwyg TextField does not accept value prop; it only accepts default value
  // This state is used to rerender Wysiwyg component

  const [updatingEmails, setUpdatingEmails] = useState(false);
  const intl = useIntl();
  const [{ fetching: loading, error }, inviteMembers] = useMutation(
    roundId ? INVITE_ROUND_MEMBERS_MUTATION : INVITE_GROUP_MEMBERS_MUTATION
  );
  const [{ data: inviteLink }] = useQuery(
    roundId
      ? {
          query: ROUND_INVITE_LINK,
          variables: { roundId },
        }
      : {
          query: GROUP_INVITE_LINK,
          variables: { groupId: currentGroup?.id },
        }
  );
  const [{ fetching: createInviteLoading }, createInviteLink] = useMutation(
    roundId ? CREATE_ROUND_INVITE_LINK : CREATE_GROUP_INVITE_LINK
  );
  const [{ fetching: deleteInviteLoading }, deleteInviteLink] = useMutation(
    roundId ? DELETE_ROUND_INVITE_LINK : DELETE_GROUP_INVITE_LINK
  );

  const link =
    inviteLink?.invitationLink?.link || inviteLink?.groupInvitationLink?.link;

  const handleAddAllFromGroup = () => {
    fetchGroupMembers();
  };

  useEffect(() => {
    if (groupMembers.data) {
      const list = emails
        .split(",")
        .map((t) => t.split(" "))
        .flat()
        .filter((i) => i);
      const emailList = list.map((i) => extractEmail(i)).flat();

      const groupMembersList =
        groupMembers.data?.groupMembersPage?.groupMembers;

      //If group member is already in invite list, dont add it.
      const newGroupMembersList = groupMembersList.filter((member) => {
        return emailList.indexOf(member.user.email || member.email) === -1;
      });
      let newEmails = emails;
      newGroupMembersList.forEach((member) => {
        const userLink = appLink(
          `/user/${member.user.id}#${member.user.email || member.email}`
        );
        newEmails += `[@${member.user.username || member.email}](${userLink}) `;
      });
      if (newEmails !== emails) {
        setUpdatingEmails(true);
        setEmails(newEmails);
        toast.success("Added all members from group");
      }
    }
  }, [groupMembers, emails]);

  useEffect(() => {
    setUpdatingEmails(false);
  }, [emails]);

  return (
    <>
      <Modal
        open={true}
        onClose={handleClose}
        className="flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-screen-sm">
          <h1 className="text-xl font-semibold mb-2">
            {roundId ? (
              <FormattedMessage defaultMessage="Invite participants to this round" />
            ) : (
              <FormattedMessage defaultMessage="Invite participants" />
            )}
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
              // In case of group, wysiwyg editor is used to add people. Wysiwyg uses markdown.
              // We need following code to extract emails
              const list = emails
                .split(",")
                .map((t) => t.split(" "))
                .flat()
                .filter((i) => i);
              const emailList = list.map((i) => extractEmail(i)).flat();
              const uniqueEmails = Array.from(new Set(emailList)).join(",");

              inviteMembers({
                ...(emails && roundGroup?.id && { emails: uniqueEmails }),
                ...variables,
                ...(roundId ? { roundId } : { groupId: currentGroup?.id }),
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
            {updatingEmails ? null : (
              <TextField
                placeholder={intl.formatMessage({
                  defaultMessage: "Comma separated emails",
                })}
                multiline
                rows={4}
                name="emails"
                defaultValue={emails}
                inputProps={{
                  onChange: (e) => setEmails(e.target.value),
                }}
                autoFocus
                error={Boolean(errors.emails)}
                helperText={errors.emails && errors.emails.message}
                inputRef={register({
                  required: "Required",
                  pattern: {
                    value: /^[\W]*([\w+\-.%]+@[\w\-.]+\.[A-Za-z]+[\W]*,{1}[\W]*)*([\w+\-.%]+@[\w\-.]+\.[A-Za-z]+)[\W]*$/,
                    message: intl.formatMessage({
                      defaultMessage:
                        "Need to be a comma separated list of emails",
                    }),
                  },
                })}
                testid="invite-participants-emails"
                showWysiwygOptions={false}
                mentionsGroupId={roundGroup?.id}
                enableMentions={roundGroup?.id}
                wysiwyg={roundGroup?.id}
              />
            )}
            {roundGroup && (
              <div className="mt-2">
                <span
                  className="text-sm font-medium mb-1 inline-block text-purple-600 cursor-pointer"
                  onClick={handleAddAllFromGroup}
                >
                  <FormattedMessage
                    defaultMessage="Add all from group {groupName}"
                    values={{
                      groupName: roundGroup?.name,
                    }}
                  />
                </span>
              </div>
            )}
            {link && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1 block">
                  <FormattedMessage defaultMessage="Anyone with this link will be able to join your round" />
                </p>
                <GridWrapper>
                  <span
                    className="mt-2 ml-2"
                    data-testid="delete-invitation-link"
                  >
                    <IconButton
                      onClick={() => {
                        deleteInviteLink(
                          roundId ? { roundId } : { groupId: currentGroup?.id }
                        ).then((result) => {
                          if (result.error) {
                            return toast.error(
                              intl.formatMessage({
                                defaultMessage:
                                  "Could not delete invitation link",
                              })
                            );
                          }
                          toast.success(
                            intl.formatMessage({
                              defaultMessage: "Invitation link deleted",
                            })
                          );
                        });
                      }}
                    >
                      <DeleteIcon className="h-5 w-5" />
                    </IconButton>
                  </span>
                  <TextField
                    inputProps={{
                      disabled: true,
                      value: link,
                    }}
                    testid="invitation-link"
                  />
                  <p
                    className="mt-4 ml-4 text-sm font-medium cursor-pointer"
                    onClick={() => {
                      navigator.clipboard
                        .writeText(link)
                        .then(() =>
                          toast.success(
                            intl.formatMessage({
                              defaultMessage: "Invitation link copied",
                            })
                          )
                        )
                        .catch(() =>
                          toast.error(
                            intl.formatMessage({
                              defaultMessage: "Error while copying link",
                            })
                          )
                        );
                    }}
                  >
                    <FormattedMessage defaultMessage="Copy" />
                  </p>
                </GridWrapper>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <Button
                className="mr-2"
                variant="secondary"
                onClick={handleClose}
              >
                <FormattedMessage defaultMessage="Close" />
              </Button>
              <Button
                className="mr-2"
                loading={createInviteLoading}
                testid="create-invitation-link"
                onClick={() => {
                  createInviteLink(
                    roundId
                      ? {
                          roundId,
                        }
                      : {
                          groupId: currentGroup?.id,
                        }
                  ).then((result) => {
                    if (result.error) {
                      return toast.error(
                        intl.formatMessage({
                          defaultMessage: "Could not create invite link",
                        })
                      );
                    }
                    toast.success(
                      intl.formatMessage({
                        defaultMessage: "Invite link created",
                      })
                    );
                  });
                }}
              >
                <FormattedMessage defaultMessage="Create Invite Link" />
              </Button>
              <Button
                type="submit"
                loading={loading}
                testid="invite-participants-email-button"
              >
                <FormattedMessage defaultMessage="Add people" />
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default InviteMembersModal;
