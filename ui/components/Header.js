import Link from "next/link";
import styled from "styled-components";
import Router from "next/router";
import cookie from "js-cookie";

import ProfileDropdown from "./ProfileDropdown";

const Header = styled.div`
  padding: 20px 0;
  display: flex;
  justify-content: space-between;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;

  > div {
    margin-left: 20px;
  }
`;

const LinkButton = styled.a`
  padding: 11px 16px;
  box-shadow: 0 3px 8px #dbe0e6;
  color: #3d4045; /* add this in theming */
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  line-height: 1;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  a {
    color: rgba(0, 0, 0, 0.8);
    font-size: 24px;
    text-decoration: none;
  }
`;

export default ({ event, currentMember, apollo }) => {
  const logOut = () => {
    cookie.remove("token");
    apollo.resetStore();
    Router.push("/");
  };
  return (
    <Header>
      <LogoSection>
        <Link href="/">
          <a>{event ? event.title : "Dreams"}</a>
        </Link>
      </LogoSection>

      <Nav>
        {event && currentMember && currentMember.event.id === event.id && (
          <Link href="/create-dream">
            <LinkButton>Create dream</LinkButton>
          </Link>
        )}
        {event ? (
          currentMember ? (
            <ProfileDropdown currentMember={currentMember}>
              {/* <li>Profile</li> */}
              {currentMember.isAdmin && (
                <li className="no-padding">
                  <Link href="/admin">
                    <a>Admin</a>
                  </Link>
                </li>
              )}
              <li onClick={logOut}>Sign out</li>
            </ProfileDropdown>
          ) : (
            <Link href="/login">
              <LinkButton>Login</LinkButton>
            </Link>
          )
        ) : (
          <Link href="/create-event">
            <LinkButton>Create event</LinkButton>
          </Link>
        )}
      </Nav>
    </Header>
  );
};
