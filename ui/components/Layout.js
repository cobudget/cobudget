import styled, { createGlobalStyle } from "styled-components";
import Head from "next/head";
import Header from "./Header";
import { modals } from "./Modal";
import Router, { useRouter } from "next/router";
import cookie from "js-cookie";
import { Box } from "@material-ui/core";
import DevelopmentNotice from "./DevelopmentNotice";

const Container = styled.div`
  flex: 0 1 1160px;
  margin: 0 20px;
  padding-bottom: 50px;
`;

export default ({
  children,
  currentMember,
  event,
  title,
  apollo,
  openModal
}) => {
  const router = useRouter();

  // check for token in query to set it and remove it from url
  React.useEffect(() => {
    if (router.query.token) {
      cookie.set("token", router.query.token, { expires: 30 });
      apollo.resetStore();
      Router.push("/"); // change this to just be replace current route?
      // trigger alert or something on invalid token
    }
  }, [router.query]);

  React.useEffect(() => {
    // this will be first time user logs in
    if (currentMember && !currentMember.name) {
      // pop modal to set user name and maybe go through a dreams walk through? :)
      openModal(modals.FINISH_SIGN_UP);
    }
  }, [currentMember]);

  const logOut = () => {
    cookie.remove("token");
    apollo.resetStore();
    Router.push("/");
  };

  return (
    <Box display="flex" justifyContent="center">
      <Head>
        <title>
          {title
            ? `${title} | Dreams`
            : event
            ? `${event.title} | Dreams`
            : "Dreams"}
        </title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
        />
      </Head>
      <Container>
        <Header
          event={event}
          currentMember={currentMember}
          openModal={openModal}
          logOut={logOut}
        />
        {children}
      </Container>
      {process.env.IS_PROD && <DevelopmentNotice />}
    </Box>
  );
};
