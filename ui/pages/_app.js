import React from "react";
import App from "next/app";
import { ApolloProvider } from "@apollo/react-hooks";
import gql from "graphql-tag";

import getHostInfo from "../utils/getHostInfo";
import withData from "../utils/apolloClient";

const EVENT_QUERY = gql`
  query Event($slug: String!) {
    event(slug: $slug) {
      slug
      id
      description
      title
      dreams {
        title
        slug
      }
    }
  }
`;

class MyApp extends App {
  render() {
    const { Component, pageProps, apollo, hostInfo, event } = this.props;

    return (
      <ApolloProvider client={apollo}>
        <Component {...pageProps} hostInfo={hostInfo} event={event} />
      </ApolloProvider>
    );
  }
}

MyApp.getInitialProps = async appContext => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);

  const hostInfo = getHostInfo(appContext.ctx.req);

  let event;

  if (hostInfo.subdomain) {
    const { data } = await appContext.ctx.apolloClient.query({
      query: EVENT_QUERY,
      variables: { slug: hostInfo.subdomain }
    });
    event = data.event;
    // redirect to root if not found?
  }

  return { ...appProps, hostInfo, event };
};
// Wraps all components in the tree with the data provider
export default withData(MyApp);
