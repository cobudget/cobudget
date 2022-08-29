import { useState, useEffect } from "react";
import { useMutation, gql, useQuery } from "urql";
import ProfileDropdown from "components/ProfileDropdown";
import Avatar from "components/Avatar";
import GroupAndRoundHeader from "./GroupAndRoundHeader";
import NavItem from "./NavItem";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { LoaderIcon } from "components/Icons";
import EditProfileModal from "./EditProfile";
import { FormattedMessage, useIntl } from "react-intl";

const css = {
  mobileProfileItem:
    "mx-1 px-3 py-2 block text-gray-800 text-left rounded hover:bg-gray-200 focus:outline-none focus:ring",
};

const JOIN_GROUP_MUTATION = gql`
  mutation JoinGroup($groupId: ID!) {
    joinGroup(groupId: $groupId) {
      id
      bio
      isAdmin
      discourseUsername
      hasDiscourseApiKey
      user {
        id
        name
        username
        email
      }
      roundMemberships {
        id
        isAdmin
        isModerator
        isApproved
        round {
          id
          title
          slug
        }
      }
      group {
        id
        slug
      }
    }
  }
`;

const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($roundId: ID!) {
    acceptInvitation(roundId: $roundId) {
      id
      isAdmin
      isModerator
      isApproved
      hasJoined
      balance
      round {
        id
        title
        slug
        group {
          id
          slug
        }
      }
    }
  }
`;

const JOIN_ROUND_MUTATION = gql`
  mutation JoinRound($roundId: ID!) {
    joinRound(roundId: $roundId) {
      id
      isAdmin
      isModerator
      isApproved
      isRemoved
      balance
      round {
        id
        title
        slug
        group {
          id
          slug
        }
      }
    }
  }
`;

const SUPER_ADMIN_START = gql`
  mutation StartSuperAdminSession ($duration: Int!) {
    startSuperAdminSession (duration: $duration) {
      id
    }
  }
`;

const Header = ({ currentUser, fetchingUser, group, round, bucket }) => {
  const router = useRouter();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const intl = useIntl();

  const [, joinGroup] = useMutation(JOIN_GROUP_MUTATION);
  const [, acceptInvitation] = useMutation(ACCEPT_INVITATION);
  const [, startSuperAdminSession] = useMutation(SUPER_ADMIN_START);

  const [, joinRound] = useMutation(JOIN_ROUND_MUTATION);
  const color = round?.color ?? "anthracit";

  const title = group
    ? round
      ? `${round.title} | ${group.name}`
      : group.name
    : round
    ? round.title
    : process.env.PLATFORM_NAME;

  const notAMember =
    !fetchingUser &&
    (!currentUser?.currentCollMember ||
      (!currentUser?.currentCollMember.isApproved &&
        currentUser?.currentCollMember.isRemoved));
  const isGroupAdmin = currentUser?.currentGroupMember?.isAdmin;
  const allowedToJoinOrRequest =
    (round && round.registrationPolicy !== "INVITE_ONLY") || isGroupAdmin;

  const showJoinRoundButton = round && notAMember && allowedToJoinOrRequest;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
        />
      </Head>
      <header className={`bg-${color} shadow-md w-full`}>
      <button onClick={() => startSuperAdminSession({ duration: 15 })}>Admin</button>
        <div className=" sm:flex sm:justify-between sm:items-center sm:py-2 md:px-4 max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between py-2 px-2 sm:p-0 relative min-w-0">
            <GroupAndRoundHeader
              currentGroup={group}
              round={round}
              color={color}
              currentUser={currentUser}
              router={router}
              bucket={bucket}
            />

            <div className="sm:hidden">
              <button
                onClick={() => setMenuOpen(!isMenuOpen)}
                className={
                  `p-1 my-1 block focus:outline-none rounded opacity-75 ` +
                  `text-white hover:bg-${color}-dark focus:bg-${color}-dark focus:opacity-100`
                }
              >
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path
                      fillRule="evenodd"
                      d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                    />
                  ) : (
                    <path d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <nav
            className={`${
              isMenuOpen ? "block" : "hidden"
            } sm:m-0 sm:block bg-${color} sm:bg-transparent`}
          >
            <div className="py-2 sm:flex sm:p-0 sm:items-center">
              {currentUser ? (
                <>
                  {currentUser?.currentCollMember?.isApproved &&
                  currentUser?.currentCollMember?.hasJoined === false ? (
                    <NavItem
                      primary
                      roundColor={color}
                      onClick={() => {
                        acceptInvitation({ roundId: round?.id }).then(
                          ({ data, error }) => {
                            console.log({ data });
                            if (error) {
                              toast.error(error.message);
                            } else {
                              toast.success(
                                intl.formatMessage({
                                  defaultMessage: "Invitation Accepted",
                                })
                              );
                            }
                          }
                        );
                      }}
                    >
                      <FormattedMessage defaultMessage="Accept Invitation" />
                    </NavItem>
                  ) : null}
                  {
                    // you can ask to be a member if you've either never been a member, or been a member but been removed
                    showJoinRoundButton && (
                      <NavItem
                        primary
                        roundColor={color}
                        onClick={() =>
                          joinRound({ roundId: round?.id }).then(
                            ({ data, error }) => {
                              console.log({ data });
                              if (error) {
                                toast.error(error.message);
                              } else {
                                toast.success(
                                  round.registrationPolicy === "REQUEST_TO_JOIN"
                                    ? intl.formatMessage({
                                        defaultMessage: "Request sent!",
                                      })
                                    : intl.formatMessage({
                                        defaultMessage:
                                          "You joined this round!",
                                      })
                                );
                              }
                            }
                          )
                        }
                      >
                        {round.registrationPolicy === "REQUEST_TO_JOIN"
                          ? intl.formatMessage({
                              defaultMessage: "Request to join",
                            })
                          : intl.formatMessage({
                              defaultMessage: "Join round",
                            })}
                      </NavItem>
                    )
                  }
                  {!currentUser?.currentGroupMember &&
                    !round &&
                    group &&
                    (group.registrationPolicy === "OPEN" ? (
                      <NavItem
                        primary
                        roundColor={color}
                        onClick={() => joinGroup({ groupId: group.id })}
                      >
                        <FormattedMessage defaultMessage="Join group" />
                      </NavItem>
                    ) : group.registrationPolicy === "REQUEST_TO_JOIN" ? (
                      <NavItem
                        primary
                        roundColor={color}
                        onClick={() => joinGroup({ groupId: group.id })}
                      >
                        <FormattedMessage defaultMessage="Request to join" />
                      </NavItem>
                    ) : null)}

                  <div className="hidden sm:block sm:ml-4">
                    <ProfileDropdown
                      currentUser={currentUser}
                      setEditProfileModalOpen={setEditProfileModalOpen}
                    />
                  </div>
                  <div data-cy="user-is-logged-in" />
                </>
              ) : fetchingUser ? (
                <LoaderIcon
                  className="animate-spin"
                  fill="white"
                  width={20}
                  height={20}
                />
              ) : (
                <>
                  <NavItem
                    href={`/login${
                      router.pathname === `/login` ? "" : "?r=" + router.asPath
                    }`}
                    roundColor={color}
                  >
                    <FormattedMessage defaultMessage="Log in" />
                  </NavItem>
                  <NavItem href={`/signup`} roundColor={color} primary>
                    <FormattedMessage defaultMessage="Sign up" />
                  </NavItem>
                </>
              )}
            </div>

            {/* Mobile view of profile dropdown contents above (i.e. all profile dropdown items are declared twice!)*/}
            {currentUser && (
              <div className="pt-4 pb-1 sm:hidden bg-white mb-4 border-gray-300">
                <div className="flex items-center px-3">
                  <Avatar user={currentUser} />
                  <div className="ml-4">
                    <span className="font-semibold text-gray-600">
                      {currentUser?.name}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex flex-col items-stretch">
                  <button
                    onClick={() => setEditProfileModalOpen(true)}
                    className={css.mobileProfileItem}
                  >
                    <FormattedMessage defaultMessage="Edit profile" />
                  </button>
                  <Link href={"/settings"}>
                    <a className={css.mobileProfileItem}>
                      <FormattedMessage defaultMessage="Email settings" />
                    </a>
                  </Link>
                  <a
                    href={"/api/auth/logout"}
                    className={css.mobileProfileItem}
                  >
                    <FormattedMessage defaultMessage="Sign out" />
                  </a>
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>
      {currentUser && (
        <EditProfileModal
          currentUser={currentUser}
          isOpen={editProfileModalOpen}
          handleClose={() => setEditProfileModalOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
