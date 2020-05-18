import styled from "styled-components";
import Head from "next/head";
import Header from "./Header";
import { modals } from "./Modal";
import Router, { useRouter } from "next/router";
import cookie from "js-cookie";
//import DevelopmentNotice from "./DevelopmentNotice";

const Container = styled.div`
  flex: 0 1 1160px;
`;

export default ({ children, currentUser, event, title, apollo, openModal }) => {
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
    if (currentUser && !currentUser.name) {
      // pop modal to set user name and maybe go through a dreams walk through? :)
      openModal(modals.FINISH_SIGN_UP);
    }
  }, [currentUser]);

  const logOut = () => {
    cookie.remove("token");
    apollo.resetStore();
    Router.push("/");
  };

  return (
    <div className="flex justify-center">
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
      <Container className="mx-3 md:mx-5 pb-10 min-h-screen flex flex-col">
        <Header
          event={event}
          currentUser={currentUser}
          openModal={openModal}
          logOut={logOut}
        />
        {children}
      </Container>
      {/* {process.env.IS_PROD && <DevelopmentNotice />} */}
    </div>
  );
};
