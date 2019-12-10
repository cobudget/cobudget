import React from "react";
import App from "next/app";
import { ApolloProvider } from "@apollo/react-hooks";
import gql from "graphql-tag";
import withData from "../utils/apolloClient";
import getHostInfo from "../utils/getHostInfo";
import Layout from "../components/Layout";

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

class MyApp extends App {
  render() {
    const {
      Component,
      pageProps,
      apollo,
      currentUser,
      event,
      hostInfo
    } = this.props;

    return (
      <ApolloProvider client={apollo}>
        <Layout currentUser={currentUser} event={event} apollo={apollo}>
          <Component
            {...pageProps}
            currentUser={currentUser}
            event={event}
            hostInfo={hostInfo}
          />
        </Layout>
      </ApolloProvider>
    );
  }
}

MyApp.getInitialProps = async appContext => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);

  let currentUser, event;

  const hostInfo = getHostInfo(appContext.ctx.req);

  if (hostInfo.subdomain) {
    const { data } = await appContext.ctx.apolloClient.query({
      query: TOP_LEVEL_QUERY,
      variables: {
        slug: hostInfo.subdomain
      }
    });
    ({ currentUser, event } = data);
  }

  return { ...appProps, currentUser, event, hostInfo };
};
// Wraps all components in the tree with the data provider
export default withData(MyApp);
