import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";

import Dream from "../../components/Dream";
import HappySpinner from "../../components/HappySpinner";
export const DREAM_QUERY = gql`
  query Dream($slug: String!, $eventId: ID!) {
    dream(slug: $slug, eventId: $eventId) {
      id
      slug
      description
      summary
      title
      minGoal
      maxGoal
      minGoalGrants
      maxGoalGrants
      currentNumberOfGrants
      approved
      members {
        id
        name
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
        amount
      }
    }
  }
`;

export default ({ event, currentMember }) => {
  if (!event) return null;
  const router = useRouter();

  const { data: { dream } = { dream: null }, loading, error } = useQuery(
    DREAM_QUERY,
    {
      variables: { slug: router.query.dream, eventId: event.id }
    }
  );

  if (dream)
    return <Dream dream={dream} event={event} currentMember={currentMember} />;

  if (loading)
    return (
      <div className="flex-grow flex justify-center items-center">
        <HappySpinner />
      </div>
    );

  return (
    <div className="flex-grow flex flex-col justify-center items-center">
      <span className="text-4xl">🛌</span>
      <h1 className="text-2xl">Can't recall this dream...</h1>
    </div>
  );
};
