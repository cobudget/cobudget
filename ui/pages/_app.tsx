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
import {IntlProvider} from "react-intl";
import lang from "../lang";

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

export const TOP_LEVEL_QUERY = gql`
  query TopLevelQuery($roundSlug: String, $groupSlug: String, $bucketId: ID) {
    round(groupSlug: $groupSlug, roundSlug: $roundSlug) {
      id
      slug
      info
      title
      archived
      color
      currency
      registrationPolicy
      visibility
      maxAmountToBucketPerUser
      bucketCreationCloses
      bucketCreationIsOpen
      grantingOpens
      grantingCloses
      grantingIsOpen
      numberOfApprovedMembers
      about
      tags {
        id
        value
      }
      allowStretchGoals
      requireBucketApproval
      bucketReviewIsOpen
      discourseCategoryId
      totalInMembersBalances
      guidelines {
        id
        title
        description
        position
      }
      customFields {
        id
        name
        description
        type
        limit
        isRequired
        position
        createdAt
      }
    }
    group(groupSlug: $groupSlug) {
      __typename
      id
      name
      info
      logo
      slug
      discourseUrl
      finishedTodos
    }
    bucket(id: $bucketId) {
      id
      title
    }
  }
`;

const MyApp = ({ Component, pageProps }) => {
  const router = useRouter();
  const [{ data, fetching, error }] = useQuery({
    query: TOP_LEVEL_QUERY,
    variables: {
      groupSlug:
        process.env.SINGLE_GROUP_MODE == "true" ? "c" : router.query.group,
      roundSlug: router.query.round,
      bucketId: router.query.bucket,
    },
  });

  const [
    { data: currentUserData, fetching: fetchingUser, error: errorUser },
  ] = useQuery({
    query: CURRENT_USER_QUERY,
    variables: {
      groupSlug:
        process.env.SINGLE_GROUP_MODE == "true" ? "c" : router.query.group,
      roundSlug: router.query.round,
    },
  });

  const { round = null, group = null, bucket = null } = data ?? {};
  const { currentUser = null } = currentUserData ?? {};

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
    <IntlProvider locale='en' messages={lang['swe']}>
      {/* legacy Modal component, use individual modals where they are called instead */}
      <Modal active={modal} closeModal={closeModal} currentUser={currentUser} />
      <FinishSignup isOpen={showFinishSignupModal} currentUser={currentUser} />
      <Layout
        currentUser={currentUser}
        fetchingUser={fetchingUser}
        openModal={openModal}
        group={group}
        round={round}
        bucket={bucket}
      >
        <Component
          {...pageProps}
          currentUser={currentUser}
          router={router}
          round={round}
          currentGroup={group}
        />
        <Toaster />
      </Layout>
    </IntlProvider>
  );
};

export default withUrqlClient(client, {
  ssr: false,
})(MyApp as any);
