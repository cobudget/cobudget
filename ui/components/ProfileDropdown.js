import React from "react";
import {
  Avatar,
  MenuItem,
  Popper,
  Grow,
  ClickAwayListener,
  MenuList,
  Typography,
  Badge
} from "@material-ui/core";

import Card from "./styled/Card";
import { modals } from "./Modal/index";
import stringToHslColor from "../utils/stringToHslColor";

const ProfileDropdown = ({ currentMember, logOut, openModal }) => {
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
      <Badge
        overlap="circle"
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
        badgeContent={currentMember.availableGrants}
        color="primary"
      >
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
            : currentMember.email.charAt(0).toUpperCase()}
        </Avatar>
      </Badge>

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
                <div>
                  <MenuList
                    autoFocusItem={open}
                    id="profile-dropdown"
                    onKeyDown={handleListKeyDown}
                  >
                    {Boolean(currentMember.availableGrants) && (
                      <MenuItem disabled>
                        You have {currentMember.availableGrants} grantlets to
                        give
                      </MenuItem>
                    )}
                    <MenuItem
                      onClick={e => {
                        openModal(modals.EDIT_PROFILE);
                        handleClose(e);
                      }}
                    >
                      Edit profile
                    </MenuItem>

                    <MenuItem
                      onClick={e => {
                        logOut();
                        handleClose(e);
                      }}
                    >
                      Logout
                    </MenuItem>
                  </MenuList>
                </div>
              </ClickAwayListener>
            </Card>
          </Grow>
        )}
      </Popper>
    </div>
  );
};

export default ProfileDropdown;
