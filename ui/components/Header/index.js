import { useState } from "react";
import Link from "next/link";
import { useMutation, gql } from "@apollo/client";
import thousandSeparator from "utils/thousandSeparator";
import ProfileDropdown from "components/ProfileDropdown";
import Avatar from "components/Avatar";
import { modals } from "components/Modal/index";
import OrganizationAndEventHeader from "./OrganizationAndEventHeader";
import NavItem from "./NavItem";

const css = {
  mobileProfileItem:
    "mx-1 px-3 py-2 block text-gray-800 text-left rounded hover:bg-gray-200 focus:outline-none focus:ring",
};

const JOIN_ORG_MUTATION = gql`
  mutation JoinOrg {
    joinOrg {
      id
      bio
    }
  }
`;

const JOIN_EVENT_MUTATION = gql`
  mutation RegisterForEvent($eventId: ID!) {
    registerForEvent(eventId: $eventId) {
      isApproved
    }
  }
`;

const Header = ({
  event,
  currentUser,
  currentOrgMember,
  currentOrg,
  openModal,
  router,
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const [joinOrg] = useMutation(JOIN_ORG_MUTATION, {
    refetchQueries: ["TopLevelQuery"],
  });

  const [joinEvent] = useMutation(JOIN_EVENT_MUTATION, {
    variables: { eventId: event?.id },
    refetchQueries: ["TopLevelQuery"],
  });
  const color = event?.color ?? "anthracit";
  return (
    <header className={`bg-${color} shadow-md w-full`}>
      <div className=" sm:flex sm:justify-between sm:items-center sm:py-2 px-2 md:px-4 max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between py-2 sm:p-0">
          <div className="flex items-center">
            <OrganizationAndEventHeader
              currentOrg={currentOrg}
              event={event}
              color={color}
              currentOrgMember={currentOrgMember}
              router={router}
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
          className={` ${
            isMenuOpen ? "block" : "hidden"
          } -ml-3 -mr-3 min-w-full sm:m-0 sm:min-w-0 sm:block bg-${
            event?.color ? event.color : "gray-100"
          } sm:bg-transparent`}
        >
          <div className="py-2 sm:flex sm:p-0 sm:items-center">
            {currentUser ? (
              <>
                {/* {currentOrgMember && event && (
                  <>
                    <NavItem
                      href="/[event]/about"
                      as={`/${event.slug}/about`}
                      currentPath={router.pathname}
                      eventColor={event.color}
                    >
                      About
                    </NavItem>

                    {currentOrgMember.currentEventMembership?.isApproved &&
                      event.dreamCreationIsOpen && (
                        <>
                          <NavItem
                            onClick={() => setNewDreamModalOpen(true)}
                            eventColor={event.color}
                            className="ml-2"
                            primary
                          >
                            New dream
                          </NavItem>
                          <NewDreamModal
                            open={newDreamModalOpen}
                            handleClose={() => setNewDreamModalOpen(false)}
                            event={event}
                          />
                        </>
                      )}
                  </>
                )} */}
                {currentOrg && (
                  <>
                    {(!currentOrgMember ||
                      !currentOrgMember.currentEventMembership) &&
                      event &&
                      (event.registrationPolicy !== "INVITE_ONLY" ||
                        currentOrgMember.isOrgAdmin) && (
                        <NavItem
                          primary
                          eventColor={color}
                          onClick={() => joinEvent()}
                        >
                          {event.registrationPolicy === "REQUEST_TO_JOIN"
                            ? "Request to join"
                            : "Join event"}
                        </NavItem>
                      )}
                    {!currentOrgMember && !event && (
                      <NavItem
                        primary
                        eventColor={color}
                        onClick={() => joinOrg()}
                      >
                        Join org
                      </NavItem>
                    )}
                  </>
                )}

                <div className="hidden sm:block sm:ml-4">
                  <ProfileDropdown
                    currentUser={currentUser}
                    currentOrgMember={currentOrgMember}
                    openModal={openModal}
                    event={event}
                  />
                </div>
              </>
            ) : (
              <NavItem href="/api/login" external eventColor={color} primary>
                Login or Sign up
              </NavItem>
            )}
          </div>

          {/* Mobile view of profile dropdown contents above (i.e. all profile dropdown items are declared twice!)*/}
          {currentOrgMember && (
            <div className="pt-4 pb-1 sm:hidden bg-white mb-4 border-gray-300">
              <div className="flex items-center px-3">
                <Avatar user={currentOrgMember.user} />
                <div className="ml-4">
                  <span className="font-semibold text-gray-600">
                    {currentOrgMember.user.name}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex flex-col items-stretch">
                {/* <Link href="/profile">
                <a className={css.mobileProfileItem}>Profile</a>
              </Link> */}
                <h2 className="px-4 text-xs my-1 font-semibold text-gray-600 uppercase tracking-wider">
                  Memberships
                </h2>
                {currentOrgMember.currentEventMembership && (
                  <div className="mx-2 px-2 py-1 rounded-lg bg-gray-200 mb-1 text-gray-800">
                    {currentOrgMember.currentEventMembership.event.title}
                    {Boolean(
                      currentOrgMember.currentEventMembership.balance
                    ) && (
                      <p className=" text-gray-800 text-sm">
                        You have{" "}
                        <span className="text-black font-medium">
                          {thousandSeparator(
                            currentOrgMember.currentEventMembership.balance /
                              100
                          )}{" "}
                          {event.currency}
                        </span>{" "}
                        to contribute
                      </p>
                    )}
                  </div>
                )}
                {currentOrgMember.eventMemberships.map((membership) => {
                  if (
                    currentOrgMember.currentEventMembership &&
                    currentOrgMember.currentEventMembership.id === membership.id
                  ) {
                    return null;
                  }
                  return (
                    <Link
                      href="/[event]"
                      as={`/${membership.event.slug}`}
                      key={membership.id}
                    >
                      <a className={css.mobileProfileItem}>
                        {membership.event.title}
                      </a>
                    </Link>
                  );
                })}
                <hr className="my-2" />

                <button
                  onClick={() => {
                    openModal(modals.EDIT_PROFILE);
                  }}
                  className={css.mobileProfileItem}
                >
                  Edit profile
                </button>
                <a href={"/api/logout"} className={css.mobileProfileItem}>
                  Sign out
                </a>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
