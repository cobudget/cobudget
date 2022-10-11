import { useState, useEffect, useRef } from "react";
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
import dayjs from "dayjs";
import { toMS } from "utils/date";

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
  mutation StartSuperAdminSession($duration: Int!) {
    startSuperAdminSession(duration: $duration) {
      id
    }
  }
`;

const SUPER_ADMIN_END = gql`
  mutation EndSuperAdminSession {
    endSuperAdminSession {
      id
    }
  }
`;

const GET_SUPER_ADMIN_SESSION = gql`
  query GetSuperAdminSession {
    getSuperAdminSession {
      id
      duration
      start
      end
    }
  }
`;

export const LandingPageLinks = ({ desktop }) => (
  <>
    <NavItem className={desktop ? "ml-4" : ""} href="/about">
      <FormattedMessage id="about" defaultMessage="About" />
    </NavItem>
    <NavItem href="/support">
      <FormattedMessage id="support" defaultMessage="Support" />
    </NavItem>
    <NavItem href="/resources">
      <FormattedMessage id="resources" defaultMessage="Resources" />
    </NavItem>
    <NavItem
      href="mailto:support@cobudget.com"
      onCLick={(e) => {
        window.open("mailto:support@boduget.com");
        e.preventDefault();
      }}
      external
    >
      <FormattedMessage id="contactUs" defaultMessage="Contact us" />
    </NavItem>
  </>
);

const Header = ({ currentUser, fetchingUser, group, round, bucket, ss }) => {
  const router = useRouter();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const intl = useIntl();

  const [{ data: superAdminSession }] = useQuery({
    query: GET_SUPER_ADMIN_SESSION,
  });
  const [, joinGroup] = useMutation(JOIN_GROUP_MUTATION);
  const [, acceptInvitation] = useMutation(ACCEPT_INVITATION);
  const [, startSuperAdminSession] = useMutation(SUPER_ADMIN_START);
  const [, endSuperAdminSession] = useMutation(SUPER_ADMIN_END);

  const [, joinRound] = useMutation(JOIN_ROUND_MUTATION);
  const color = round?.color ?? "anthracit";
  const [superAdminTime, setSuperAdminTime] = useState<HTMLElement>();
  const [inSession, setInSession] = useState(false);

  useEffect(() => {
    if (ss?.start + ss?.duration * 60000 - Date.now() > 0) {
      setInSession(true);
    }
    if (superAdminTime) {
      const interval = setInterval(() => {
        const diff = ss?.start + ss?.duration * 60000 - Date.now();
        if (diff < 0 || !ss) {
          clearInterval(interval);
          window.alert("Session Expired");
          setInSession(false);
          return;
        }
        if (superAdminTime && superAdminTime?.innerHTML) {
          superAdminTime.innerHTML = toMS(diff) + "";
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [ss, superAdminTime]);

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
      <header className={`bg-${color} shadow-md w-full z-10 relative`}>
        <div className=" sm:flex sm:justify-between sm:items-center sm:py-2 md:px-4 max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between py-2 px-2 sm:p-0 relative min-w-0">
            <div className="flex items-center max-w-screen overflow-hidden">
              {process.env.SINGLE_GROUP_MODE !== "true" && (
                <>
                  <Link href="/">
                    <a
                      className={`p-1 text-white hover:text-white rounded-md font-medium flex space-x-4`}
                    >
                      <img
                        src="/cobudget-logo.png"
                        className="h-6 max-w-none"
                      />
                      {!currentUser &&
                        !group &&
                        !round &&
                        !process.env.LANDING_PAGE_URL && (
                          <h1 className="leading-normal">
                            {process.env.PLATFORM_NAME}
                          </h1>
                        )}
                    </a>
                  </Link>

                  {!currentUser &&
                    !group &&
                    !round &&
                    process.env.LANDING_PAGE_URL && (
                      <div className="hidden sm:flex items-center">
                        <LandingPageLinks desktop />
                      </div>
                    )}
                </>
              )}

              <GroupAndRoundHeader
                currentGroup={group}
                round={round}
                color={color}
                currentUser={currentUser}
                router={router}
                bucket={bucket}
              />
            </div>

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

                  {currentUser.isSuperAdmin &&
                    (inSession ? (
                      <span className="text-white text-sm">
                        <span
                          className="cursor-pointer font-bold"
                          onClick={() => {
                            endSuperAdminSession();
                          }}
                        >
                          ✕
                        </span>
                        <span className="ml-4">Super Admin</span>
                        <span
                          className="ml-2 font-medium font-mono"
                          ref={(ref) => setSuperAdminTime(ref)}
                        >
                          .
                        </span>
                      </span>
                    ) : (
                      <>
                        <span className="text-white">Admin Session</span>
                        <div className="inline-flex mx-4">
                          <button
                            className="text-xs bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
                            onClick={() =>
                              startSuperAdminSession({ duration: 15 })
                            }
                          >
                            15
                          </button>
                          <button
                            className="text-xs bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4"
                            onClick={() =>
                              startSuperAdminSession({ duration: 30 })
                            }
                          >
                            30
                          </button>
                          <button
                            className="text-xs bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
                            onClick={() =>
                              startSuperAdminSession({ duration: 60 })
                            }
                          >
                            60
                          </button>
                        </div>
                      </>
                    ))}
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
                  <div className="sm:hidden">
                    <hr className="mt-4 mb-2 mx-4 opacity-25" />
                    <LandingPageLinks desktop={false} />
                  </div>
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
