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
import HappySpinner from "components/HappySpinner";

export const TOP_LEVEL_QUERY = gql`
  query TopLevelQuery($roundSlug: String, $groupSlug: String) {
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
      tags {
        id
        value
      }
    }

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

    currentGroup(groupSlug: $groupSlug) {
      __typename
      id
      name
      info
      logo
      slug
      customDomain
      discourseUrl
      finishedTodos
    }
  }
`;

const MyApp = ({ Component, pageProps }) => {
  const router = useRouter();
  const [{ data, fetching, error }] = useQuery({
    query: TOP_LEVEL_QUERY,
    variables: {
      groupSlug: router.query.group,
      roundSlug: router.query.round,
    },
    pause: !router.isReady,
  });

  const { currentUser = null, currentGroup = null, round = null } = data ?? {};

  useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles && jssStyles.parentNode)
      jssStyles.parentNode.removeChild(jssStyles);
  });

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

  if (fetching && !data) {
    return (
      <div className="flex-grow flex justify-center items-center h-64">
        <HappySpinner />
      </div>
    );
  }

  return (
    <>
      <Modal
        active={modal}
        closeModal={closeModal}
        currentUser={currentUser}
        currentGroup={currentGroup}
      />
      <FinishSignup isOpen={showFinishSignupModal} currentUser={currentUser} />
      <Layout
        currentUser={currentUser}
        currentGroup={currentGroup}
        openModal={openModal}
        round={round}
        router={router}
        title={
          currentGroup
            ? round
              ? `${round.title} | ${currentGroup.name}`
              : currentGroup.name
            : round
            ? round.title
            : "Cobudget"
        }
      >
        <Component
          {...pageProps}
          round={round}
          currentUser={currentUser}
          currentGroup={currentGroup}
          openModal={openModal}
          router={router}
        />
        <Toaster />
      </Layout>
    </>
  );
};

//@ts-ignore
export default withUrqlClient(client, { ssr: false })(MyApp as any);
