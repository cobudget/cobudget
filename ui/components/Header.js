import { useState } from "react";
import Link from "next/link";
import { Badge } from "@material-ui/core";
import { useRouter } from "next/router";

import ProfileDropdown from "components/ProfileDropdown";
import Avatar from "components/Avatar";
import LoginModal from "components/LoginModal";
import { modals } from "components/Modal/index";
import { CogIcon, HomeIcon } from "components/Icons";
import EditEventModal from "components/Event/EditEventModal";
import NewDreamModal from "components/NewDreamModal";
import IconButton from "components/IconButton";

const css = {
  mobileProfileItem:
    "mx-1 px-3 py-2 block text-gray-800 text-left rounded hover:bg-gray-200 focus:outline-none focus:shadow-outline",
};

const NavItem = ({ onClick, href, as, currentPath, children, primary }) => {
  if (Boolean(onClick)) {
    return (
      <button
        className={`my-1 mx-1 px-3 py-2 sm:px-3 sm:my-0 block font-medium rounded-md focus:outline-none hover:bg-gray-200 focus:bg-gray-200 text-gray-800`}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }
  return (
    <Link href={href} as={as}>
      <a
        className={`my-1 mx-1 px-3 py-2 sm:px-3 sm:my-0 block font-medium rounded-md focus:outline-none  ${
          (currentPath === href ? "bg-gray-200" : "") +
          " " +
          (primary
            ? "bg-black text-white hover:bg-gray-900"
            : "hover:bg-gray-200 focus:bg-gray-200 text-gray-800")
        }`}
      >
        {children}
      </a>
    </Link>
  );
};

export default ({ event, currentUser, openModal, logOut }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [editEventModalOpen, setEditEventModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [newDreamModalOpen, setNewDreamModalOpen] = useState(false);

  const router = useRouter();
  return (
    <header className=" sm:flex sm:justify-between sm:items-center sm:py-4">
      <div className="flex items-center justify-between py-4 sm:p-0">
        <div className="flex items-center">
          {event ? (
            <>
              <div className="mr-2">
                <Link href="/">
                  <a className="block p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800">
                    <HomeIcon className="h-5 w-5 " />
                  </a>
                </Link>
              </div>
              <div className="group flex items-center">
                <Link href="/[event]" as={`/${event.slug}`}>
                  <a>
                    <h1 className="text-lg font-medium text-gray-900 hover:text-gray-900">
                      {event.title}
                    </h1>
                  </a>
                </Link>
                {currentUser?.membership?.isAdmin && (
                  <>
                    <IconButton
                      onClick={() => setEditEventModalOpen(true)}
                      className="ml-2 invisible group-hover:visible text-gray-500 hover:text-gray-800"
                    >
                      <CogIcon className="h-5 w-5" />
                    </IconButton>

                    <EditEventModal
                      open={editEventModalOpen}
                      event={event}
                      handleClose={() => setEditEventModalOpen(false)}
                    />
                  </>
                )}
              </div>
            </>
          ) : (
            <h1 className="text-lg font-medium text-gray-900 ">Dreams</h1>
          )}
        </div>

        <div className="sm:hidden">
          <button
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="p-1 my-1 block text-gray-700 hover:text-black focus:outline-none rounded hover:bg-gray-300 focus:bg-gray-300"
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
        } -ml-3 -mr-3 min-w-full sm:m-0 sm:min-w-0 sm:block border-t sm:border-0`}
      >
        <div className="py-1 sm:flex sm:p-0 sm:items-center">
          {currentUser ? (
            <>
              {event && (
                <>
                  {/* {event.about && (
                    <Link href="/[event]/about" as={`/${event.slug}/about`}>
                      <a className={css.navItem}>About</a>
                    </Link>
                  )} */}
                  {currentUser.membership ? (
                    <>
                      <NavItem
                        href="/[event]/granting"
                        as={`/${event.slug}/granting`}
                        currentPath={router.pathname}
                      >
                        Granting
                      </NavItem>

                      {currentUser.membership.isAdmin && (
                        <>
                          <NavItem
                            href="/[event]/members"
                            as={`/${event.slug}/members`}
                            currentPath={router.pathname}
                          >
                            Members
                          </NavItem>
                        </>
                      )}

                      {event.dreamCreationIsOpen &&
                        currentUser.membership.isApproved && (
                          <>
                            <NavItem
                              onClick={() => setNewDreamModalOpen(true)}
                              // primary
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
                  ) : (
                    <>
                      {event.registrationPolicy !== "INVITE_ONLY" && (
                        <NavItem
                          href="/[event]/register"
                          as={`/${event.slug}/register`}
                          currentPath={router.pathname}
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

              {!event && currentUser.isOrgAdmin && (
                <NavItem href="/create-event">Create event</NavItem>
              )}

              <div className="hidden sm:block sm:ml-4">
                <ProfileDropdown
                  currentUser={currentUser}
                  logOut={logOut}
                  openModal={openModal}
                  event={event}
                />
              </div>
            </>
          ) : (
            <>
              <NavItem onClick={() => setLoginModalOpen(true)}>
                Login or Sign up
              </NavItem>
              <LoginModal
                open={loginModalOpen}
                handleClose={() => setLoginModalOpen(false)}
              />
            </>
          )}
        </div>

        {/* Mobile view of profile dropdown contents above (i.e. all profile dropdown items are declared twice!)*/}
        {currentUser && (
          <div className="pt-4 pb-1 sm:hidden border-t border-b mb-4 border-gray-300">
            <div className="flex items-center px-3">
              <Badge
                overlap="circle"
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                badgeContent={
                  currentUser.membership &&
                  currentUser.membership.availableGrants
                }
                color="primary"
              >
                <Avatar user={currentUser} />
              </Badge>
              <div className="ml-4">
                <span className="font-semibold text-gray-600">
                  {currentUser.name}
                </span>
                {/* {currentUser.membership &&
                  Boolean(currentUser.membership.availableGrants) && (
                    <span className="block text-sm text-gray-600">
                      You have {currentUser.membership.availableGrants} grants
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
              {currentUser.membership && (
                <div className="mx-2 px-2 py-1 rounded-lg bg-gray-200 mb-1 text-gray-800">
                  {currentUser.membership.event.title}
                  {Boolean(currentUser.membership.availableGrants) && (
                    <p className=" text-gray-800 text-sm">
                      You have {currentUser.membership.availableGrants} grants
                      left
                    </p>
                  )}
                </div>
              )}
              {currentUser.memberships.map((membership) => {
                if (
                  currentUser.membership &&
                  currentUser.membership.id === membership.id
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
    </header>
  );
};
