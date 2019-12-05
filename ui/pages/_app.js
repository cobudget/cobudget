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

const CURRENT_USER_QUERY = gql`
  {
    currentUser {
      name
      email
    }
  }
`;

class MyApp extends App {
  render() {
    const {
      Component,
      pageProps,
      apollo,
      hostInfo,
      event,
      currentUser
    } = this.props;

    return (
      <ApolloProvider client={apollo}>
        <Component
          {...pageProps}
          hostInfo={hostInfo}
          event={event}
          currentUser={currentUser}
          apollo={apollo}
        />
      </ApolloProvider>
    );
  }
}

MyApp.getInitialProps = async appContext => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);

  const {
    data: { currentUser }
  } = await appContext.ctx.apolloClient.query({
    query: CURRENT_USER_QUERY
  });

  const hostInfo = getHostInfo(appContext.ctx.req);

  let event;

  if (hostInfo.subdomain) {
    const { data } = await appContext.ctx.apolloClient.query({
      query: EVENT_QUERY,
      variables: { slug: hostInfo.subdomain }
    });
    ({ event } = data);
  }

  return { ...appProps, hostInfo, event, currentUser };
};
// Wraps all components in the tree with the data provider
export default withData(MyApp);
