import React from 'react';
import App from 'next/app';
import { ApolloProvider } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import withData from '../utils/apolloClient';
import getHostInfoFromReq from '../utils/getHostInfo';
import { useQuery } from '@apollo/react-hooks';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';

import Layout from '../components/Layout';
import Modal from '../components/Modal';

const TOP_LEVEL_QUERY = gql`
  query EventAndMember($slug: String!) {
    event(slug: $slug) {
      id
      slug
      description
      title
      currency
      registrationPolicy
    }
    currentMember {
      id
      name
      avatar
      email
      isAdmin
      event {
        id
      }
    }
  }
`;

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    fontSize: 16,
  },
});

const MyApp = ({ Component, pageProps, apollo, hostInfo }) => {
  let currentMember, event;

  React.useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentNode) jssStyles.parentNode.removeChild(jssStyles);
  });

  if (hostInfo.subdomain) {
    const { data } = useQuery(TOP_LEVEL_QUERY, {
      variables: { slug: hostInfo.subdomain },
      client: apollo,
    });
    if (data) {
      currentMember = data.currentMember;
      event = data.event;
    }
  }

  const [modal, setModal] = React.useState(null);

  const openModal = (name) => {
    if (modal !== name) setModal(name);
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <ApolloProvider client={apollo}>
        <Modal event={event} active={modal} closeModal={closeModal} />
        <Layout currentMember={currentMember} event={event} apollo={apollo} openModal={openModal}>
          <Component
            {...pageProps}
            currentMember={currentMember}
            event={event}
            hostInfo={hostInfo}
            openModal={openModal}
          />
        </Layout>
      </ApolloProvider>
    </ThemeProvider>
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
