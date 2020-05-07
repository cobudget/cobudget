import gql from "graphql-tag";
import { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import Link from "next/link";
import { useRouter } from "next/router";
import DreamCard from "../../components/DreamCard";
import HappySpinner from "../../components/HappySpinner";
import Filterbar from "../../components/Filterbar";

export const DREAMS_QUERY = gql`
  query Dreams($eventId: ID!, $textSearchTerm: String) {
    dreams(eventId: $eventId, textSearchTerm: $textSearchTerm) {
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

export default ({ currentMember, event }) => {
  console.log({ event });
  if (!event) return null;
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [textSearchTerm, setTextSearchTerm] = useState("");
  const toggleFilterFavorites = () => setFilterFavorites(!filterFavorites);

  let { data: { dreams } = { dreams: [] }, loading, error } = useQuery(
    DREAMS_QUERY,
    {
      variables: { eventId: event.id, textSearchTerm },
    }
  );

  if (filterFavorites) {
    dreams = dreams.filter((dream) => dream.favorite);
  }

  return (
    <>
      <Filterbar
        filterFavorites={filterFavorites}
        toggleFilterFavorites={toggleFilterFavorites}
        textSearchTerm={textSearchTerm}
        setTextSearchTerm={setTextSearchTerm}
        currentMember={currentMember}
      />

      {loading ? (
        <div className="flex-grow flex justify-center items-center">
          <HappySpinner />
        </div>
      ) : (
        <>
          {dreams.length ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {dreams.map((dream) => (
                <Link
                  href="/[event]/[dream]"
                  as={`/${event.slug}/${dream.slug}`}
                  key={dream.slug}
                >
                  <a className="flex focus:outline-none focus:shadow-outline rounded-lg">
                    <DreamCard dream={dream} currentMember={currentMember} />
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex-grow flex flex-col justify-center items-center">
              <h1 className="text-3xl text-gray-500 text-center">
                No dreams...
              </h1>
            </div>
          )}
        </>
      )}
    </>
  );
};
