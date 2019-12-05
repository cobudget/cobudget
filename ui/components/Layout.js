import styled, { createGlobalStyle } from "styled-components";

// nav
import Link from "next/link";
import Head from "next/head";
import { useQuery } from "@apollo/react-hooks";
import { isMemberOfEvent } from "../utils/helpers";
import { EVENT_QUERY } from "../pages/[event]/";
import Dropdown from "./Dropdown";
const GlobalStyle = createGlobalStyle`
  html {
    box-sizing: border-box;
    font-size: 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    background: #f1f3f5;
  }
  
  *, *:before, *:after {
    box-sizing: inherit;
  }

  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  body, h1, h2, h3, h4, h5, h6, p, ol, ul {
    margin: 0;
    padding: 0;
    font-weight: normal;
  }
  
  ol, ul {
    list-style: none;
  }
  
  img {
    max-width: 100%;
    height: auto;
  }
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const InnerContainer = styled.div`
  flex: 0 1 1100px;
  margin: 0 20px;
`;

const Header = styled.div`
  padding: 20px 0;
  display: flex;
  justify-content: space-between;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  a {
    margin-left: 20px;
  }
  div {
    margin-left: 20px;
  }
`;

const Logo = styled.img`
  width: 180px;
  height: 41px;
`;

const Circle = styled.div`
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 500;
  border-radius: 25px;
  color: white;
  text-transform: uppercase;
  overflow: hidden;
  cursor: pointer;
`;

function stringToHslColor(str, s = 50, l = 70) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  var h = hash % 360;
  return "hsl(" + h + ", " + s + "%, " + l + "%)";
}

const Avatar = ({ user }) => {
  if (user.avatar) {
    return (
      <Circle>
        <img src={user.avatar} />
      </Circle>
    );
  }
  const bgColor = stringToHslColor(user.email);
  const letter = user.name ? user.name.charAt(0) : user.email.charAt(0); // hmm exposing emails might not be good for other avatars...

  return <Circle style={{ background: bgColor }}>{letter}</Circle>;
};

const LinkButton = styled.a`
  padding: 5px;
  color: rgba(0, 0, 0, 0.8); /* add this in theming */
  border: 2px solid black;
  border-radius: 6px;
  cursor: pointer;
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

export default ({ children, currentUser, eventSlug, title }) => {
  let event;
  if (eventSlug) {
    const { data, loading, error } = useQuery(EVENT_QUERY, {
      variables: { slug: eventSlug }
    });
    event = data && data.event;
  }

  const isMember = isMemberOfEvent(currentUser, event);
  return (
    <Wrapper>
      <Head>
        <title>
          {title
            ? `${title} | Dreams`
            : event
            ? `${event.title} | Dreams`
            : "Dreams"}
        </title>
      </Head>
      <InnerContainer>
        <Header>
          <LogoSection>
            <Link href="/">
              <a>
                <Logo src="/dreams-logo.gif" />
              </a>
            </Link>

            {event && (
              <Link href="/[event]" as={`/${event.slug}`}>
                <a className="event-title">{event.title}</a>
              </Link>
            )}
          </LogoSection>

          <Nav>
            {event && currentUser && isMember && (
              <Link
                href="/[event]/create-dream"
                as={`/${event.slug}/create-dream`}
              >
                <LinkButton>Create dream</LinkButton>
              </Link>
            )}
            {currentUser ? (
              <Avatar user={currentUser} />
            ) : (
              <Link href="/login">
                <LinkButton>Sign in</LinkButton>
              </Link>
            )}
          </Nav>
        </Header>

        {children}
      </InnerContainer>
      <GlobalStyle />
    </Wrapper>
  );
};
