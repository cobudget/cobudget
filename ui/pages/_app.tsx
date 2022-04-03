import { useEffect, useState } from "react";
import "../styles.css";
import "react-tippy/dist/tippy.css";
import { withUrqlClient, initUrqlClient } from "next-urql";
import { client } from "../graphql/client";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { useQuery, gql } from "urql";
import { Toaster } from "react-hot-toast";
import FinishSignup from "components/FinishSignup";
import { useRouter } from "next/router";

export const CURRENT_USER_QUERY = gql`
  query CurrentUser($roundSlug: String, $groupSlug: String) {
    currentUser {
      id
      username
      name
      avatar
      email

      groupMemberships {
        id
        isAdmin
        group {
          id
          name
          slug
          logo
        }
      }
      roundMemberships {
        id
        isAdmin
        isApproved
        round {
          id
          title
          slug
          group {
            id
            name
            slug
            logo
          }
        }
      }
      currentCollMember(groupSlug: $groupSlug, roundSlug: $roundSlug) {
        id
        isAdmin
        isModerator
        isApproved
        isRemoved
        hasJoined
        balance
        round {
          id
          title
        }
      }
      currentGroupMember(groupSlug: $groupSlug) {
        id
        bio
        isAdmin
        discourseUsername
        hasDiscourseApiKey
      }
    }
  }
`;

const MyApp = ({ Component, pageProps }) => {
  const router = useRouter();
  const [{ data, fetching, error }] = useQuery({
    query: CURRENT_USER_QUERY,
    variables: {
      groupSlug:
        process.env.SINGLE_GROUP_MODE == "true" ? "c" : router.query.group,
      roundSlug: router.query.round,
    },
    pause: !router.isReady,
  });

  const { currentUser = null } = data ?? {};

  useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles && jssStyles.parentNode)
      jssStyles.parentNode.removeChild(jssStyles);
  });

  // legacy modal logic
  const [modal, setModal] = useState(null);
  const openModal = (name) => {
    if (modal !== name) setModal(name);
  };
  const closeModal = () => {
    setModal(null);
  };

  const showFinishSignupModal = !!(currentUser && !currentUser.username);

  if (error) {
    console.error("Top level query failed:", error);
    return error.message;
  }

  return (
    <>
      {/* legacy Modal component, use individual modals where they are called instead */}
      <Modal active={modal} closeModal={closeModal} currentUser={currentUser} />
      <FinishSignup isOpen={showFinishSignupModal} currentUser={currentUser} />
      <Layout currentUser={currentUser} openModal={openModal}>
        <Component {...pageProps} currentUser={currentUser} router={router} />
        <Toaster />
      </Layout>
    </>
  );
};

export default withUrqlClient(client, { ssr: false })(MyApp as any);
