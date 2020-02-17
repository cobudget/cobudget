import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import gql from "graphql-tag";
import withData from "../utils/apolloClient";
import getHostInfoFromReq from "../utils/getHostInfo";
import { useQuery } from "@apollo/react-hooks";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

import Layout from "../components/Layout";
import Modal from "../components/Modal";

export const TOP_LEVEL_QUERY = gql`
  query EventAndMember($slug: String!) {
    event(slug: $slug) {
      id
      slug
      description
      title
      currency
      registrationPolicy
      totalBudget
      grantValue
      grantsPerMember
      dreamCreationCloses
      dreamCreationIsOpen
      grantingOpens
      grantingCloses
      grantingIsOpen
      totalBudgetGrants
      remainingGrants
      numberOfApprovedMembers
    }

    currentMember {
      id
      name
      avatar
      email
      isAdmin
      availableGrants
      event {
        id
      }
    }
  }
`;

const theme = createMuiTheme({
  overrides: {
    MuiButton: {
      contained: {
        borderRadius: "6px",
        backgroundColor: "white",
        "&:hover": {
          backgroundColor: "white"
        }
      }
    }
  },
  typography: {
    button: {
      textTransform: "none"
    },
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(","),
    fontSize: 14
  },
  shadows: [
    "none",
    "0px 2px 1px -1px rgba(63, 75, 90,0.1),0px 1px 1px 0px rgba(63, 75, 90,0.08),0px 1px 3px 0px rgba(63, 75, 90,0.06)",
    "0px 3px 8px -2px rgba(63, 75, 90,0.1),0px 2px 2px 0px rgba(63, 75, 90,0.08),0px 1px 5px 0px rgba(63, 75, 90,0.06)",
    "0px 3px 3px -2px rgba(63, 75, 90,0.1),0px 3px 4px 0px rgba(63, 75, 90,0.08),0px 1px 8px 0px rgba(63, 75, 90,0.06)",
    "0px 2px 8px -1px rgba(63, 75, 90,0.1),0px 4px 5px 0px rgba(63, 75, 90,0.08),0px 1px 10px 0px rgba(63, 75, 90,0.06)",
    "0px 3px 5px -1px rgba(63, 75, 90,0.1),0px 5px 8px 0px rgba(63, 75, 90,0.08),0px 1px 14px 0px rgba(63, 75, 90,0.06)",
    "0px 3px 5px -1px rgba(63, 75, 90,0.1),0px 6px 10px 0px rgba(63, 75, 90,0.08),0px 1px 18px 0px rgba(63, 75, 90,0.06)",
    "0px 4px 5px -2px rgba(63, 75, 90,0.1),0px 7px 10px 1px rgba(63, 75, 90,0.08),0px 2px 16px 1px rgba(63, 75, 90,0.06)",
    "0px 5px 5px -3px rgba(63, 75, 90,0.1),0px 8px 10px 1px rgba(63, 75, 90,0.08),0px 3px 14px 2px rgba(63, 75, 90,0.06)",
    "0px 5px 6px -3px rgba(63, 75, 90,0.1),0px 9px 12px 1px rgba(63, 75, 90,0.08),0px 3px 16px 2px rgba(63, 75, 90,0.06)",
    "0px 6px 6px -3px rgba(63, 75, 90,0.1),0px 10px 14px 1px rgba(63, 75, 90,0.08),0px 4px 18px 3px rgba(63, 75, 90,0.06)",
    "0px 6px 7px -4px rgba(63, 75, 90,0.1),0px 11px 15px 1px rgba(63, 75, 90,0.08),0px 4px 20px 3px rgba(63, 75, 90,0.06)",
    "0px 7px 8px -4px rgba(63, 75, 90,0.1),0px 12px 17px 2px rgba(63, 75, 90,0.08),0px 5px 22px 4px rgba(63, 75, 90,0.06)",
    "0px 7px 8px -4px rgba(63, 75, 90,0.1),0px 13px 19px 2px rgba(63, 75, 90,0.08),0px 5px 24px 4px rgba(63, 75, 90,0.06)",
    "0px 7px 9px -4px rgba(63, 75, 90,0.1),0px 14px 21px 2px rgba(63, 75, 90,0.08),0px 5px 26px 4px rgba(63, 75, 90,0.06)",
    "0px 8px 9px -5px rgba(63, 75, 90,0.1),0px 15px 22px 2px rgba(63, 75, 90,0.08),0px 6px 28px 5px rgba(63, 75, 90,0.06)",
    "0px 8px 10px -5px rgba(63, 75, 90,0.1),0px 16px 24px 2px rgba(63, 75, 90,0.08),0px 6px 30px 5px rgba(63, 75, 90,0.06)",
    "0px 8px 11px -5px rgba(63, 75, 90,0.1),0px 17px 26px 2px rgba(63, 75, 90,0.08),0px 6px 32px 5px rgba(63, 75, 90,0.06)",
    "0px 9px 11px -5px rgba(63, 75, 90,0.1),0px 18px 28px 2px rgba(63, 75, 90,0.08),0px 7px 34px 6px rgba(63, 75, 90,0.06)",
    "0px 9px 12px -6px rgba(63, 75, 90,0.1),0px 19px 29px 2px rgba(63, 75, 90,0.08),0px 7px 36px 6px rgba(63, 75, 90,0.06)",
    "0px 10px 13px -6px rgba(63, 75, 90,0.1),0px 20px 31px 3px rgba(63, 75, 90,0.08),0px 8px 38px 7px rgba(63, 75, 90,0.06)",
    "0px 10px 13px -6px rgba(63, 75, 90,0.1),0px 21px 33px 3px rgba(63, 75, 90,0.08),0px 8px 40px 7px rgba(63, 75, 90,0.06)",
    "0px 10px 14px -6px rgba(63, 75, 90,0.1),0px 22px 35px 3px rgba(63, 75, 90,0.08),0px 8px 42px 7px rgba(63, 75, 90,0.06)",
    "0px 11px 14px -7px rgba(63, 75, 90,0.1),0px 23px 36px 3px rgba(63, 75, 90,0.08),0px 9px 44px 8px rgba(63, 75, 90,0.06)",
    "0px 11px 15px -7px rgba(63, 75, 90,0.1),0px 24px 38px 3px rgba(63, 75, 90,0.08),0px 9px 46px 8px rgba(63, 75, 90,0.06)"
  ]
});

const MyApp = ({ Component, pageProps, apollo, hostInfo }) => {
  let currentMember, event;

  React.useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles && jssStyles.parentNode)
      jssStyles.parentNode.removeChild(jssStyles);
  });

  if (hostInfo.subdomain) {
    const { data } = useQuery(TOP_LEVEL_QUERY, {
      variables: { slug: hostInfo.subdomain },
      client: apollo
    });
    if (data) {
      currentMember = data.currentMember;
      event = data.event;
    }
  }

  const [modal, setModal] = React.useState(null);

  const openModal = name => {
    if (modal !== name) setModal(name);
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <ApolloProvider client={apollo}>
        <Modal
          active={modal}
          closeModal={closeModal}
          currentMember={currentMember}
        />
        <Layout
          currentMember={currentMember}
          event={event}
          apollo={apollo}
          openModal={openModal}
        >
          <Component
            {...pageProps}
            currentMember={currentMember}
            event={event}
            hostInfo={hostInfo}
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
