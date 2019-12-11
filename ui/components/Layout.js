import styled, { createGlobalStyle } from "styled-components";
import Head from "next/head";
import Header from "./Header";
import Router, { useRouter } from "next/router";
import cookie from "js-cookie";

const GlobalStyle = createGlobalStyle`
  @font-face {
      font-family: 'Inter-Bold';
      src: url('/fonts/Inter-SemiBold.woff') format('woff');
  }
  html {
    box-sizing: border-box;
    font-size: 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    background: #FCFCFC;
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

  h1 {
    margin-bottom: 20px;
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
  flex: 0 1 1160px;
  margin: 0 20px;
  padding-bottom: 50px;
`;

export default ({ children, currentUser, event, title, apollo }) => {
  const router = useRouter();

  // check for token in query to set it and remove it from url
  React.useEffect(() => {
    if (router.query.token) {
      cookie.set("token", router.query.token, { expires: 30 });
      apollo.resetStore();
      Router.push("/");
    }
  }, [router.query]);

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
        <Header event={event} currentUser={currentUser} apollo={apollo} />
        {children}
      </InnerContainer>
      <GlobalStyle />
    </Wrapper>
  );
};
