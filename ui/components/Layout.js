import React from "react";
import Head from "next/head";
import Header from "./Header";

const LinkOut = ({ href, children }) => {
  return (
    <a className="underline" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
};

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
        {children}
      </div>

      <div className="space-y-2 text-sm text-center mt-auto py-8 text-gray-500">
        <div>
          You are using <LinkOut href="https://cobudget.com/">Cobudget</LinkOut>
          . Source code available{" "}
          <LinkOut href="https://github.com/cobudget/cobudget">online</LinkOut>.
        </div>
        <div className="space-x-6">
          <LinkOut href="/privacy-policy">Privacy Policy</LinkOut>
          <LinkOut href="/terms-and-conditions">Terms and Conditions</LinkOut>
        </div>
      </div>
    </div>
  );
};

export default Layout;
