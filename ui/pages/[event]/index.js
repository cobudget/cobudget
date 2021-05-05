import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import Link from "next/link";
import DreamCard from "components/DreamCard";
import HappySpinner from "components/HappySpinner";
import Filterbar from "components/Filterbar";
import SubMenu from "components/SubMenu";
import PageHero from "components/PageHero";
import Button from "components/Button";
import NewDreamModal from "components/NewDreamModal";
import EditableField from "components/EditableField";

export const DREAMS_QUERY = gql`
  query Dreams($eventSlug: String!, $textSearchTerm: String) {
    dreams(eventSlug: $eventSlug, textSearchTerm: $textSearchTerm) {
      id
      description
      summary
      title
      minGoal
      maxGoal
      totalContributions
      numberOfComments
      favorite
      published
      approved
      canceled
      customFields {
        value
        customField {
          id
          name
          type
          description
          isRequired
          position
          isShownOnFrontPage
          createdAt
        }
      }
      images {
        id
        small
        large
      }
    }
  }
`;

const EventPage = ({ currentOrgMember, event, router }) => {
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [textSearchTerm, setTextSearchTerm] = useState("");
  const [filterLabels, setFilterLabels] = useState();
  const [newDreamModalOpen, setNewDreamModalOpen] = useState(false);

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
        eventSlug: router.query.event,
        ...(textSearchTerm && { textSearchTerm }),
      },
    }
  );
  if (error) {
    console.error(error);
  }
  if (!event) return null;

  // useEffect(() => {
  //   const { infoBoxDismissed = false } = store.get(event.slug) || {};
  //   if (infoBoxDismissed) setShowInfoBox(false);
  // }, []);

  if (filterFavorites) {
    dreams = dreams.filter((dream) => dream.favorite);
  }

  if (filterLabels) {
    dreams = dreams.filter((dream) => {
      if (!dream.customFields || dream.customFields.length == 0) return;
      const existingField = dream.customFields.filter((field) => {
        return field.customField.id == filterLabels.id;
      });
      if (existingField && existingField.length > 0) {
        return existingField[0].value;
      }
    });
  }

  return (
    <>
      <SubMenu currentOrgMember={currentOrgMember} event={event} />
      <PageHero>
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="col-span-2">
              <EditableField
                value={event.info}
                label="Add homepage message"
                placeholder={`# Welcome to ${event.title}'s dream page`}
                canEdit={
                  currentOrgMember?.isOrgAdmin ||
                  currentOrgMember?.currentEventMembership?.isAdmin
                }
                name="info"
                className="h-10"
                MUTATION={gql`
                  mutation EditHomepageMessage($eventId: ID!, $info: String) {
                    editEvent(eventId: $eventId, info: $info) {
                      id
                      info
                    }
                  }
                `}
                variables={{ eventId: event.id }}
              />
            </div>
            <div className="flex justify-end items-start">
              {event.dreamCreationIsOpen &&
                currentOrgMember?.currentEventMembership?.isApproved && (
                  <>
                    <Button
                      size="large"
                      color={event.color}
                      onClick={() => setNewDreamModalOpen(true)}
                    >
                      New dream
                    </Button>
                    {newDreamModalOpen && (
                      <NewDreamModal
                        event={event}
                        handleClose={() => setNewDreamModalOpen(false)}
                      />
                    )}
                  </>
                )}
            </div>
          </div>
        </div>
      </PageHero>

      <div className="page flex-1">
        <Filterbar
          filterFavorites={filterFavorites}
          toggleFilterFavorites={toggleFilterFavorites}
          textSearchTerm={textSearchTerm}
          setTextSearchTerm={setTextSearchTerm}
          currentOrgMember={currentOrgMember}
          customFields={event.customFields}
          filterLabels={filterLabels}
          setFilterLabels={setFilterLabels}
        />

        {loading ? (
          <div className="flex-grow flex justify-center items-center h-64">
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
                    <a className="flex focus:outline-none focus:ring rounded-lg">
                      <DreamCard
                        dream={dream}
                        event={event}
                        currentOrgMember={currentOrgMember}
                        filterLabels={filterLabels}
                      />
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex-grow flex flex-col justify-center items-center h-64">
                <h1 className="text-3xl text-gray-500 text-center ">
                  No dreams...
                </h1>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default EventPage;
