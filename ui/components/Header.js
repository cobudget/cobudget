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
  /* a {
    margin-left: 20px;
  }
  div {
    margin-left: 20px;
  } */
  > div {
    margin-left: 20px;
  }
`;

const Logo = styled.img`
  width: 180px;
  height: 41px;
`;

const LinkButton = styled.a`
  padding: 11px 16px;
  box-shadow: 0 3px 8px #dbe0e6;
  color: #3d4045; /* add this in theming */
  background: white;
  border-radius: 6px;
  font-weight: 400;
  cursor: pointer;
  font-family: "Inter-SemiBold";
  line-height: 1;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  .event-title {
    color: rgba(0, 0, 0, 0.8);
    font-size: 24px;
    text-decoration: none;
  }
`;

export default ({ event, currentUser, apollo }) => {
  const logOut = () => {
    cookie.remove("token");
    apollo.resetStore();
    Router.push("/");
  };
  return (
    <Header>
      <LogoSection>
        {event ? (
          <Link href="/">
            <a className="event-title">{event.title}</a>
          </Link>
        ) : (
          <Link href="/">
            <a>
              <Logo src="/dreams-logo.gif" />
            </a>
          </Link>
        )}
      </LogoSection>

      <Nav>
        {event && currentUser && currentUser.event.id === event.id && (
          <Link href="/create-dream">
            <LinkButton>Create dream</LinkButton>
          </Link>
        )}
        {event &&
          (currentUser ? (
            <ProfileDropdown currentUser={currentUser}>
              {/* <li>Profile</li> */}
              <li onClick={logOut}>Sign out</li>
            </ProfileDropdown>
          ) : (
            <Link href="/login">
              <LinkButton>Login -></LinkButton>
            </Link>
          ))}
      </Nav>
    </Header>
  );
};
