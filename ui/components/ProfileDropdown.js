import React from "react";
import styled from "styled-components";

import Avatar from "./Avatar";

const Dropdown = styled.div`
  width: 100px;
  right: 0px;
  top: 48px;
  position: absolute;
  background: white;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 1px 6px 0 rgba(100, 105, 110, 0.3);
`;

const List = styled.ul`
  background: white;
  list-style: none;
  padding: 0;
  margin: 0;
  li {
    font-size: 14px;
    line-height: 18px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    user-select: none;
    color: #3d4045;
    display: block;
    padding: 6px 8px;
    text-decoration: none;

    a {
      color: #3d4045;
      display: block;
      padding: 6px 8px;
      text-decoration: none;
    }

    &:hover {
      background: #f4f5f6;
    }

    &:last-child {
      border-bottom: 0;
      color: #9aa1aa;
      a {
        color: #9aa1aa;
      }
    }
  }
`;

const Container = styled.div`
  position: relative;
`;

const ProfileDropdown = ({ currentMember, children }) => {
  const [dropdownExpanded, setDropdownExpanded] = React.useState(false);

  const inputRef = React.useRef(null);

  const toggleDropdown = () => {
    setDropdownExpanded(!dropdownExpanded);
  };

  const handleClick = e => {
    if (dropdownExpanded) {
      if (inputRef.current && !inputRef.current.contains(e.target))
        toggleDropdown();
    }
  };

  React.useEffect(() => {
    document.addEventListener("mousedown", handleClick, false);
    return () => {
      document.removeEventListener("mousedown", handleClick, false);
    };
  });

  return (
    <Container ref={inputRef}>
      <Avatar onClick={toggleDropdown} user={currentMember} />
      {dropdownExpanded && (
        <Dropdown>
          <List>{children}</List>
        </Dropdown>
      )}
    </Container>
  );
};

export default ProfileDropdown;
