import React from "react";
import Head from "next/head";
import Header from "./Header";

const Layout = ({
  children,
  currentUser,
  currentOrg,
  collection,
  title,
  openModal,
  router,
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
        />
      </Head>
      <div>
        <Header
          collection={collection}
          currentUser={currentUser}
          currentOrg={currentOrg}
          openModal={openModal}
          router={router}
        />
        <div className="">{children}</div>
      </div>

      {/* {process.env.IS_PROD && <DevelopmentNotice />} */}
      <div className="space-x-6 text-sm text-center mt-auto pt-10 pb-4 text-gray-500">
        <a href="/privacy-policy" target="_blank" rel="noreferrer">
          Privacy Policy
        </a>
        <a href="/terms-and-conditions" target="_blank" rel="noreferrer">
          Terms and Conditions
        </a>
      </div>
    </div>
  );
};

export default Layout;
