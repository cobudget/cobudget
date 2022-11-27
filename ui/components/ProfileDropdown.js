import React, { useEffect } from "react";
import Avatar from "./Avatar";
import Link from "next/link";
import { FormattedMessage } from "react-intl";

const css = {
  button:
    "text-left block px-2 py-1 text-gray-800 last:text-gray-500 hover:bg-gray-200 rounded-lg focus:outline-none focus:bg-gray-200",
};

const ProfileDropdown = ({ currentUser, setEditProfileModalOpen }) => {
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Esc" || e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="z-20 relative block rounded-full focus:outline-none focus:ring"
      >
        <Avatar user={currentUser} size="small" />
      </button>

      {open && (
        <>
          <button
            onClick={() => setOpen(false)}
            tabIndex="-1"
            className="z-10 fixed inset-0 h-full w-full cursor-default"
          ></button>

          <div className="z-20 mt-2 p-2 space-y-1 absolute right-0 w-36 bg-white rounded-lg shadow-2xl flex flex-col flex-stretch">
            {/* <h2 className="px-4 text-xs my-1 font-semibold text-gray-500 uppercase tracking-wider">
              Memberships
            </h2>
            {currentUser.currentCollMember && (
              <div className="mx-2 px-2 py-1 rounded-lg bg-gray-200 mb-1 text-gray-800">
                {currentUser.currentCollMember.round.title}
                {Boolean(currentUser.currentCollMember.balance) && (
                  <p className="mt-1 text-gray-800 text-sm">
                    You have{" "}
                    <span className="text-black font-medium">
                      {thousandSeparator(
                        currentUser.currentCollMember.balance / 100
                      )}{" "}
                      {event.currency}
                    </span>{" "}
                    to contribute
                  </p>
                )}
              </div>
            )}
            {currentGroupMember?.roundMemberships.map((membership) => {
              if (
                currentGroupMember.currentEventMembership &&
                currentGroupMember.currentEventMembership.id === membership.id
              ) {
                return null;
              }
              return (
                <Link
                  href="/[group]/[round]"
                  as={`/${currentGroup.slug}/${membership.event.slug}`}
                  key={membership.event.slug}
                >
                  <a className={css.button}>{membership.event.title}</a>
                </Link>
              );
            })}

            <hr className="my-2" /> */}

            <button
              onClick={() => {
                setEditProfileModalOpen(true);
                setOpen(false);
              }}
              className={css.button}
            >
              <FormattedMessage defaultMessage="Edit profile" />
            </button>
            <Link href="/settings">
              <a className={css.button}>
                <FormattedMessage defaultMessage="Email settings" />
              </a>
            </Link>
            <a href="/api/auth/logout" className={css.button}>
              <FormattedMessage defaultMessage="Sign out" />
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileDropdown;
