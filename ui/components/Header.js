import Link from "next/link";
import { Badge } from "@material-ui/core";

import ProfileDropdown from "./ProfileDropdown";
import Avatar from "./Avatar";
import { modals } from "./Modal/index";

const css = {
  navItem:
    "my-1 px-3 mx-1 py-2 sm:px-3 sm:m-0 block text-gray-800 font-semibold rounded hover:bg-gray-200 focus:outline-none focus:shadow-outline",
  mobileProfileItem:
    "mx-1 px-3 py-2 block text-gray-800 text-left rounded hover:bg-gray-200 focus:outline-none focus:shadow-outline",
};

export default ({ event, currentUser, openModal, logOut }) => {
  const [isMenuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className=" sm:flex sm:justify-between sm:items-center sm:py-4">
      <div className="flex items-center justify-between py-4 sm:p-0">
        <Link
          href={event ? "/[event]" : "/"}
          as={event ? `/${event.slug}` : "/"}
        >
          <a>
            <h1 className="text-2xl text-gray-800">
              {event ? event.title : "Dreams"}
            </h1>
          </a>
        </Link>

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
                  {currentUser.membership ? (
                    <>
                      {currentUser.membership.isAdmin && (
                        <Link href="/[event]/admin" as={`/${event.slug}/admin`}>
                          <a className={css.navItem}>Admin</a>
                        </Link>
                      )}

                      {event.dreamCreationIsOpen &&
                        currentUser.membership.isApproved && (
                          <Link
                            href="/[event]/create-dream"
                            as={`/${event.slug}/create-dream`}
                          >
                            <a className={css.navItem}>Create dream</a>
                          </Link>
                        )}
                    </>
                  ) : (
                    <>
                      {event.registrationPolicy !== "INVITE_ONLY" && (
                        <Link
                          href="/[event]/register"
                          as={`/${event.slug}/register`}
                        >
                          <a className={css.navItem}>
                            {event.registrationPolicy === "REQUEST_TO_JOIN"
                              ? "Request to join"
                              : "Join"}
                          </a>
                        </Link>
                      )}
                    </>
                  )}
                </>
              )}

              {!event && currentUser.isOrgAdmin && (
                <Link href="/create-event">
                  <a className={css.navItem}>Create event</a>
                </Link>
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
              <Link href="/login">
                <a className={css.navItem}>Login</a>
              </Link>
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
                {currentUser.membership &&
                  Boolean(currentUser.membership.availableGrants) && (
                    <span className="block text-sm text-gray-600">
                      You have {currentUser.membership.availableGrants} grants
                      left
                    </span>
                  )}
              </div>
            </div>
            <div className="mt-2 flex flex-col items-stretch">
              <Link href="/profile">
                <a className={css.mobileProfileItem}>Profile</a>
              </Link>
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
