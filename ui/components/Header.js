import Link from "next/link";
import styled from "styled-components";
import { Button, Box } from "@material-ui/core";

import ProfileDropdown from "./ProfileDropdown";

const Header = styled.div`
  padding: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  a.logo {
    text-decoration: none;
    color: rgba(0, 0, 0, 0.8);
    h1 {
      font-size: 24px;
      margin: 0;
    }
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;

  > div {
    margin-left: 20px;
  }
`;

export default ({ event, currentMember, openModal, logOut }) => {
  return (
    <Header>
      <Link href="/">
        <a className="logo">
          <h1>{event ? event.title : "Dreams"}</h1>
        </a>
      </Link>

      <Nav>
        {event && currentMember && currentMember.isAdmin && (
          <Box m="0 10px">
            <Link href="/admin">
              <Button component="a">Admin</Button>
            </Link>
          </Box>
        )}
        {event &&
          event.dreamCreationOpen &&
          currentMember &&
          currentMember.event.id === event.id && (
            <Link href="/create-dream">
              <Button component="a" variant="contained">
                Create dream
              </Button>
            </Link>
          )}
        {event ? (
          currentMember ? (
            <ProfileDropdown
              currentMember={currentMember}
              logOut={logOut}
              openModal={openModal}
            />
          ) : (
            <Link href="/login">
              <Button component="a" variant="contained">
                Login
              </Button>
            </Link>
          )
        ) : (
          <Link href="/create-event">
            <Button component="a" variant="contained">
              Create event
            </Button>
          </Link>
        )}
      </Nav>
    </Header>
  );
};
