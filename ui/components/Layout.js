import React from "react";
import Head from "next/head";
import Header from "./Header";

const Layout = ({
  children,
  currentUser,
  currentOrgMember,
  currentOrg,
  event,
  title,
  openModal,
  router,
}) => {
  return (
    <div>
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
      <div>
        <Header
          event={event}
          currentUser={currentUser}
          currentOrgMember={currentOrgMember}
          currentOrg={currentOrg}
          openModal={openModal}
          router={router}
        />
        <div className="mx-2 md:mx-4 pb-10 flex justify-center">{children}</div>
      </div>

      {/* {process.env.IS_PROD && <DevelopmentNotice />} */}
    </div>
  );
};

export default Layout;
