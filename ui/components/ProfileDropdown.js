import React from "react";
import Router from "next/router";
import {
  Avatar,
  MenuItem,
  Popper,
  Grow,
  ClickAwayListener,
  MenuList
} from "@material-ui/core";

import Card from "./styled/Card";
import stringToHslColor from "../utils/stringToHslColor";

const ProfileDropdown = ({ currentMember, logOut }) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div>
      <Avatar
        ref={anchorRef}
        aria-controls={open ? "profile-dropdown" : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        alt={currentMember.name && currentMember.name}
        src={currentMember.avatar && currentMember.avatar}
        style={{
          backgroundColor: stringToHslColor(
            currentMember.name ? currentMember.name : currentMember.email
          ),
          fontWeight: 500,
          cursor: "pointer"
        }}
      >
        {currentMember.name
          ? currentMember.name.charAt(0)
          : currentMember.emal.charAt(0)}
      </Avatar>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        placement="bottom-end"
        style={{ zIndex: 1 }}
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: "right top",
              marginTop: 10
            }}
          >
            <Card>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="profile-dropdown"
                  onKeyDown={handleListKeyDown}
                >
                  {currentMember.isAdmin && (
                    <MenuItem
                      onClick={e => {
                        Router.push("/admin");
                        handleClose(e);
                      }}
                    >
                      Admin
                    </MenuItem>
                  )}
                  {/* <MenuItem onClick={handleClose}>Edit profile</MenuItem> */}
                  <MenuItem
                    onClick={e => {
                      logOut();
                      handleClose(e);
                    }}
                  >
                    Logout
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Card>
          </Grow>
        )}
      </Popper>
    </div>
  );
};

export default ProfileDropdown;
