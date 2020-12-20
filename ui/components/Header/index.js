import { useState } from "react";
import Link from "next/link";
import { Badge } from "@material-ui/core";
import { useRouter } from "next/router";

import ProfileDropdown from "components/ProfileDropdown";
import Avatar from "components/Avatar";
import { modals } from "components/Modal/index";
import NewDreamModal from "components/NewDreamModal";
import OrganizationOnlyHeader from "./OrganizationOnlyHeader";
import OrganizationAndEventHeader from "./OrganizationAndEventHeader";

const css = {
  mobileProfileItem:
    "mx-1 px-3 py-2 block text-gray-800 text-left rounded hover:bg-gray-200 focus:outline-none focus:shadow-outline",
};

const NavItem = ({
  onClick,
  href,
  as,
  currentPath = "",
  className,
  children,
  primary,
  eventColor,
}) => {
  const active = currentPath === href;

  const regularClasses = `border-transparent text-gray-800 hover:bg-gray-300`;
  const primaryClasses = `border-anthracit hover:bg-anthracit-darker hover:text-gray-200`;
  const regularEventClasses = `border-transparent text-white hover:bg-${eventColor}-darker`;
  const primaryEventClasses = `border-white text-white hover:bg-white hover:text-${eventColor}`;
  const eventActiveClasses = `border-transparent bg-${eventColor}-darker text-white`;

  const colorsClasses = eventColor
    ? primary
      ? primaryEventClasses
      : active
      ? eventActiveClasses
      : regularEventClasses
    : primary
    ? primaryClasses
    : regularClasses;

  const classes =
    "my-1 mx-1 px-3 py-1 sm:my-0 block rounded focus:outline-none font-medium transitions-colors transitions-opacity duration-75 border-2 " +
    colorsClasses +
    " " +
    className;

  if (Boolean(onClick)) {
    return (
      <button className={classes} onClick={onClick}>
        {children}
      </button>
    );
  }
  return (
    <Link href={href} as={as}>
      <a className={classes}>{children}</a>
    </Link>
  );
};

export default ({
  event,
  currentUser,
  currentOrgMember,
  currentOrg,
  openModal,
  logOut,
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [newDreamModalOpen, setNewDreamModalOpen] = useState(false);

  const router = useRouter();
  return (
    <header
      className={
        (event?.color ? `bg-${event.color} shadow-md` : "") + " mb-8 w-full"
      }
    >
      <div className=" sm:flex sm:justify-between sm:items-center sm:py-2 px-2 md:px-4">
        <div className="flex items-center justify-between py-2 sm:p-0">
          <div className="flex items-center">
            {event ? (
              <OrganizationAndEventHeader
                currentOrg={currentOrg}
                event={event}
                currentUser={currentUser}
              />
            ) : (
              <OrganizationOnlyHeader currentOrg={currentOrg} />
            )}
          </div>

          <div className="sm:hidden">
            <button
              onClick={() => setMenuOpen(!isMenuOpen)}
              className={
                `p-1 my-1 block focus:outline-none rounded opacity-75 ` +
                (event?.color
                  ? `text-white hover:bg-${event.color}-darker focus:bg-${event.color}-darker focus:opacity-100`
                  : "text-gray-800 hover:bg-gray-200")
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
                {currentOrgMember && event && (
                  <>
                    <NavItem
                      href="/[event]/about"
                      as={`/${event.slug}/about`}
                      currentPath={router.pathname}
                      eventColor={event.color}
                    >
                      About
                    </NavItem>
                    {(currentOrgMember.currentEventMembership?.isAdmin ||
                      currentOrgMember.isOrgAdmin) && (
                      <>
                        <NavItem
                          href="/[event]/members"
                          as={`/${event.slug}/members`}
                          currentPath={router.pathname}
                          eventColor={event.color}
                        >
                          Members
                        </NavItem>
                      </>
                    )}

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

                    {currentOrgMember &&
                      !currentOrgMember.currentEventMembership && (
                        <>
                          {event.registrationPolicy !== "INVITE_ONLY" && (
                            <NavItem
                              href="/[event]/register"
                              as={`/${event.slug}/register`}
                              currentPath={router.pathname}
                              eventColor={event.color}
                              primary
                            >
                              {event.registrationPolicy === "REQUEST_TO_JOIN"
                                ? "Request to join"
                                : "Join"}
                            </NavItem>
                          )}
                        </>
                      )}
                  </>
                )}

                {!event && currentOrgMember.isOrgAdmin && (
                  <NavItem
                    primary
                    currentPath={router.pathname}
                    href="/create-event"
                  >
                    New event
                  </NavItem>
                )}

                <div className="hidden sm:block sm:ml-4">
                  <ProfileDropdown
                    currentUser={currentUser}
                    currentOrgMember={currentOrgMember}
                    logOut={logOut}
                    openModal={openModal}
                    event={event}
                  />
                </div>
              </>
            ) : (
              <>
                {currentOrg && (
                  <>
                    <NavItem
                      href="/api/login"
                      eventColor={event?.color}
                      primary
                    >
                      Login or Sign up
                    </NavItem>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile view of profile dropdown contents above (i.e. all profile dropdown items are declared twice!)*/}
          {currentOrgMember && (
            <div className="pt-4 pb-1 sm:hidden bg-white mb-4 border-gray-300">
              <div className="flex items-center px-3">
                <Badge
                  overlap="circle"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  badgeContent={
                    currentOrgMember.currentEventMembership &&
                    currentOrgMember.currentEventMembership.availableGrants
                  }
                  color="primary"
                >
                  <Avatar user={currentOrgMember.user} />
                </Badge>
                <div className="ml-4">
                  <span className="font-semibold text-gray-600">
                    {currentOrgMember.user.name}
                  </span>
                  {/* {currentOrgMember.currentEventMembership &&
                  Boolean(currentOrgMember.currentEventMembership.availableGrants) && (
                    <span className="block text-sm text-gray-600">
                      You have {currentOrgMember.currentEventMembership.availableGrants} grants
                      left
                    </span>
                  )} */}
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
                      currentOrgMember.currentEventMembership.availableGrants
                    ) && (
                      <p className=" text-gray-800 text-sm">
                        You have{" "}
                        {
                          currentOrgMember.currentEventMembership
                            .availableGrants
                        }{" "}
                        grants left
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
                <button onClick={logOut} className={css.mobileProfileItem}>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
