import React from "react";
import App from "next/app";
import { ApolloProvider } from "@apollo/react-hooks";
import gql from "graphql-tag";
import withData from "../utils/apolloClient";

const CURRENT_USER_QUERY = gql`
  {
    currentUser {
      name
      email
      memberships {
        event {
          id
          title
          slug
        }
      }
    }
  }
`;

class MyApp extends App {
  render() {
    const { Component, pageProps, apollo, currentUser } = this.props;


    return (
      <ApolloProvider client={apollo}>
        <Component {...pageProps} currentUser={currentUser} apollo={apollo} />
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

  return { ...appProps, currentUser };
};
// Wraps all components in the tree with the data provider
export default withData(MyApp);
