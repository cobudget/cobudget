import gql from "graphql-tag";
import { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import Link from "next/link";
import DreamCard from "../../components/DreamCard";
import HappySpinner from "../../components/HappySpinner";
import Filterbar from "../../components/Filterbar";
import InfoBox from "../../components/InfoBox";

export const DREAMS_QUERY = gql`
  query Dreams($eventId: ID!, $textSearchTerm: String) {
    dreams(eventId: $eventId, textSearchTerm: $textSearchTerm) {
      id
      description
      summary
      title
      minGoalGrants
      maxGoalGrants
      currentNumberOfGrants
      numberOfComments
      favorite
      published
      images {
        small
        large
      }
    }
  }
`;

export default ({ currentUser, event }) => {
  if (!event) return null;
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [textSearchTerm, setTextSearchTerm] = useState("");
  const toggleFilterFavorites = () => setFilterFavorites(!filterFavorites);

  // const [showInfoBox, setShowInfoBox] = useState(true);
  // const dismissInfoBox = () => {
  //   store.set(event.slug, { infoBoxDismissed: true });
  //   setShowInfoBox(false);
  // };

  let { data: { dreams } = { dreams: [] }, loading, error } = useQuery(
    DREAMS_QUERY,
    {
      variables: {
        eventId: event.id,
        ...(textSearchTerm && { textSearchTerm }),
      },
    }
  );

  // useEffect(() => {
  //   const { infoBoxDismissed = false } = store.get(event.slug) || {};
  //   if (infoBoxDismissed) setShowInfoBox(false);
  // }, []);

  if (filterFavorites) {
    dreams = dreams.filter((dream) => dream.favorite);
  }

  return (
    <>
      {event.info && <InfoBox markdown={event.info} />}

      <Filterbar
        filterFavorites={filterFavorites}
        toggleFilterFavorites={toggleFilterFavorites}
        textSearchTerm={textSearchTerm}
        setTextSearchTerm={setTextSearchTerm}
        currentUser={currentUser}
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
                  as={`/${event.slug}/${dream.id}`}
                  key={dream.id}
                >
                  <a className="flex focus:outline-none focus:shadow-outline rounded-lg">
                    <DreamCard
                      dream={dream}
                      event={event}
                      currentUser={currentUser}
                    />
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
