import React, { useEffect } from "react";
import { Badge } from "@material-ui/core";
import Router from "next/router";
import Avatar from "./Avatar";
import { modals } from "./Modal/index";

const css = {
  button:
    "text-left block mx-2 px-2 py-1 text-gray-800 last:text-gray-500 hover:bg-gray-200 rounded-lg focus:outline-none focus:bg-gray-200",
};

const ProfileDropdown = ({ currentUser, event, logOut, openModal }) => {
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
        className="z-20 relative block rounded-full focus:outline-none focus:shadow-outline"
      >
        <Badge
          overlap="circle"
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          badgeContent={
            currentUser.membership && currentUser.membership.availableGrants
          }
          color="primary"
        >
          <Avatar user={currentUser} />
        </Badge>
      </button>

      {open && (
        <>
          <button
            onClick={() => setOpen(false)}
            tabIndex="-1"
            className="z-10 fixed inset-0 h-full w-full cursor-default"
          ></button>

          <div className="z-20 mt-2 py-2 absolute right-0 w-48 bg-white rounded-lg shadow-2xl flex flex-col flex-stretch">
            {Boolean(
              currentUser.membership && currentUser.membership.availableGrants
            ) && (
              <p className="px-3 pb-2 mb-2 text-gray-600 text-sm border-b border-gray-200">
                You have {currentUser.membership.availableGrants} grants left
              </p>
            )}

            <button
              onClick={() => {
                Router.push("/profile");
                setOpen(false);
              }}
              className={css.button}
            >
              Profile
            </button>

            <button
              onClick={() => {
                openModal(modals.EDIT_PROFILE);
                setOpen(false);
              }}
              className={css.button}
            >
              Edit profile
            </button>
            <button onClick={logOut} className={css.button}>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileDropdown;
