import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import Link from "next/link";
import LandingPage from "../components/LandingPage";
import DreamCard from "../components/DreamCard";
import HappySpinner from "../components/HappySpinner";

export const DREAMS_QUERY = gql`
  query Dreams($eventId: ID!) {
    dreams(eventId: $eventId) {
      id
      slug
      description
      summary
      title
      minGoalGrants
      maxGoalGrants
      currentNumberOfGrants
      numberOfComments
      favorite
      images {
        small
        large
      }
    }
  }
`;

export default ({ currentMember, event, hostInfo }) => {
  if (!event) return <LandingPage hostInfo={hostInfo} />;

  const { data: { dreams } = { dreams: [] }, loading, error } = useQuery(
    DREAMS_QUERY,
    {
      variables: { eventId: event.id }
    }
  );

  if (loading)
    return (
      <div className="flex-grow flex justify-center items-center">
        <HappySpinner />
      </div>
    );

  if (dreams.length === 0)
    return (
      <div className="flex-grow flex flex-col justify-center items-center">
        <span className="text-5xl">💤</span>
        <h1 className="text-3xl text-gray-600 text-center">
          Still in deep sleep, no dreams yet...
        </h1>
      </div>
    );

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {dreams.map(dream => (
        <Link href="/[dream]" as={`/${dream.slug}`} key={dream.slug}>
          <a className="flex focus:outline-none focus:shadow-outline rounded-lg">
            <DreamCard dream={dream} />
          </a>
        </Link>
      ))}
    </div>
  );
};
