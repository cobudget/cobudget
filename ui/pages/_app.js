import React from "react";
import App from "next/app";
import { ApolloProvider } from "@apollo/react-hooks";
import gql from "graphql-tag";
import withData from "../utils/apolloClient";
import getHostInfoFromReq from "../utils/getHostInfo";
import { useQuery } from "@apollo/react-hooks";

import Layout from "../components/Layout";
import Modal from "../components/Modal";

const TOP_LEVEL_QUERY = gql`
  query EventAndMember($slug: String!) {
    event(slug: $slug) {
      id
      slug
      description
      title
      currency
    }
    currentUser {
      id
      name
      email
      event {
        id
      }
    }
  }
`;
const MyApp = ({ Component, pageProps, apollo, hostInfo }) => {
  let currentUser, event;

  if (hostInfo.subdomain) {
    const { data } = useQuery(TOP_LEVEL_QUERY, {
      variables: { slug: hostInfo.subdomain },
      client: apollo
    });
    currentUser = data && data.currentUser;
    event = data && data.event;
  }

  const [modal, setModal] = React.useState(null);

  const openModal = name => {
    if (modal !== name) setModal(name);
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <ApolloProvider client={apollo}>
      <Modal active={modal} closeModal={closeModal} />
      <Layout
        currentUser={currentUser}
        event={event}
        apollo={apollo}
        openModal={openModal}
      >
        <Component
          {...pageProps}
          currentUser={currentUser}
          event={event}
          hostInfo={hostInfo}
        />
      </Layout>
    </ApolloProvider>
  );
};

MyApp.getInitialProps = async ({ Component, ctx }) => {
  let pageProps = {};

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  const hostInfo = getHostInfoFromReq(ctx.req);

  return { pageProps, hostInfo };
};

export default withData(MyApp);

// MyApp.getInitialProps = async ({ Component, ctx }) => {
//   let pageProps = {};

//   if (Component.getInitialProps) {
//     pageProps = await Component.getInitialProps(ctx);
//   }
//   return { pageProps };
// };

// MyApp.getInitialProps = async appContext => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);

//   let currentUser, event;

//   const hostInfo = getHostInfo(appContext.ctx.req);

//   if (hostInfo.subdomain) {
//     const { data } = await appContext.ctx.apolloClient.query({
//       query: TOP_LEVEL_QUERY,
//       variables: {
//         slug: hostInfo.subdomain
//       }
//     });
//     ({ currentUser, event } = data);
//   }

//   return { ...appProps, currentUser, event, hostInfo };
// };
// // Wraps all components in the tree with the data provider
// export default withData(MyApp);
