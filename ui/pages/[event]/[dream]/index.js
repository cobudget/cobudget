import { useQuery, useSubscription, gql } from "@apollo/client";
import Head from "next/head";

import Dream from "../../../components/Dream";
import HappySpinner from "../../../components/HappySpinner";

export const DREAM_QUERY = gql`
  query Dream($id: ID!) {
    dream(id: $id) {
      id
      description
      summary
      title
      minGoal
      maxGoal
      totalContributions
      approved
      published
      completed
      completedAt
      funded
      fundedAt
      canceled
      canceledAt
      raisedFlags {
        id
        comment
        guideline {
          id
          title
        }
      }
      customFields {
        id
        value
        customField {
          id
          name
          type
          limit
          description
          isRequired
          position
          isShownOnFrontPage
          createdAt
        }
      }
      cocreators {
        id
        orgMember {
          id
          user {
            id
            username
            avatar
          }
        }
      }
      images {
        id
        small
        large
      }
      comments {
        id
        discourseUsername
        cooked
        content
        createdAt
        isLog
        orgMember {
          id
          user {
            id
            username
            avatar
          }
        }
      }
      discourseTopicUrl
      numberOfComments
      logs {
        createdAt
        type
        details {
          ... on FlagRaisedDetails {
            comment
            guideline {
              title
            }
          }
          ... on FlagResolvedDetails {
            comment
            guideline {
              title
            }
          }
        }
      }
      budgetItems {
        id
        description
        min
        max
        type
      }
    }
  }
`;

const DreamPage = ({
  event,
  currentUser,
  currentOrgMember,
  currentOrg,
  router,
}) => {
  const COMMENTS_CHANGED = gql`
    subscription OnCommentChanged($dreamID: ID!) {
      commentsChanged(dreamID: $dreamID) {
        id
      }
    }
  `;

  const {
    data: { dream } = { dream: null },
    loading,
    error,
    refetch,
  } = useQuery(DREAM_QUERY, {
    onCompleted: console.log,
    variables: { id: router.query.dream },
  });
  useSubscription(COMMENTS_CHANGED, {
    variables: { dreamID: dream?.id },
    onSubscriptionData: () => {
      console.log("refetching...");
      refetch();
    },
  });

  if (dream)
    return (
      <div className="page">
        <Head>
          <title>
            {dream.title} | {event.title}
          </title>
        </Head>
        <Dream
          dream={dream}
          event={event}
          currentUser={currentUser}
          currentOrgMember={currentOrgMember}
          currentOrg={currentOrg}
        />
      </div>
    );

  if (loading)
    return (
      <div className="flex-grow flex justify-center items-center h-64">
        <HappySpinner />
      </div>
    );

  if (error) {
    console.error(error);
    return (
      <div className="flex-grow flex justify-center items-center">
        {error.message}
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col justify-center items-center">
      <span className="text-4xl">🛌</span>
      <h1 className="text-2xl">Can't recall this dream...</h1>
    </div>
  );
};

export default DreamPage;
