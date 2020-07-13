import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";
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
      minGoalGrants
      maxGoalGrants
      currentNumberOfGrants
      approved
      published
      customFields {
        value
        customField {
          id
          name
          type
          description
          isRequired
          isShownOnFrontPage
          createdAt
        }
      }
      cocreators {
        id
        user {
          id
          name
          avatar
        }
      }
      images {
        small
        large
      }
      numberOfComments
      comments {
        id
        content
        createdAt
        author {
          id
          name
          avatar
        }
      }
      budgetItems {
        description
        min
        max
        type
      }
    }
  }
`;

export default ({ event, currentUser }) => {
  if (!event) return null;
  const router = useRouter();

  const { data: { dream } = { dream: null }, loading, error } = useQuery(
    DREAM_QUERY,
    {
      variables: { id: router.query.dream },
    }
  );

  if (dream)
    return (
      <div className="max-w-screen-2lg flex-1">
        <Head>
          <title>
            {dream.title} | {event.title}
          </title>
        </Head>
        <Dream dream={dream} event={event} currentUser={currentUser} />
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
