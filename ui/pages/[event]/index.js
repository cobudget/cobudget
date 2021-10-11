import { useState } from "react";
import { useQuery, gql } from "urql";
import Link from "next/link";
import DreamCard from "components/DreamCard";
import Filterbar from "components/Filterbar";
import SubMenu from "components/SubMenu";
import PageHero from "components/PageHero";
import Button from "components/Button";
import NewDreamModal from "components/NewDreamModal";
import EditableField from "components/EditableField";
import LoadMore from "components/LoadMore";
import dreamName from "utils/dreamName";

export const DREAMS_QUERY = gql`
  query Dreams(
    $eventSlug: String!
    $textSearchTerm: String
    $tag: String
    $offset: Int
    $limit: Int
  ) {
    dreamsPage(
      eventSlug: $eventSlug
      textSearchTerm: $textSearchTerm
      tag: $tag
      offset: $offset
      limit: $limit
    ) {
      moreExist
      dreams(
        eventSlug: $eventSlug
        textSearchTerm: $textSearchTerm
        tag: $tag
        offset: $offset
        limit: $limit
      ) {
        id
        description
        summary
        title
        minGoal
        maxGoal
        income
        totalContributions
        numberOfComments
        published
        approved
        canceled
        customFields {
          value
          customField {
            id
            name
            type
            limit
            description
            isRequired
            position
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
  }
`;

const EventPage = ({ currentOrgMember, event, router, currentOrg }) => {
  const [newDreamModalOpen, setNewDreamModalOpen] = useState(false);

  const { tag, s } = router.query;

  const [
    {
      data: { dreamsPage: { moreExist, dreams } } = {
        dreamsPage: { dreams: [] },
      },
      fetching: loading,
      error,
      fetchMore,
    },
  ] = useQuery({
    query: DREAMS_QUERY,
    variables: {
      eventSlug: router.query.event,
      offset: 0,
      limit: 9,
      ...(!!s && { textSearchTerm: s }),
      ...(!!tag && { tag }),
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  console.log({ dreams });

  if (error) {
    console.error(error);
  }
  if (!event) return null;

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
                      New {dreamName(currentOrg)}
                    </Button>
                    {newDreamModalOpen && (
                      <NewDreamModal
                        event={event}
                        handleClose={() => setNewDreamModalOpen(false)}
                        currentOrg={currentOrg}
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
          textSearchTerm={s}
          currentOrgMember={currentOrgMember}
          tag={tag}
          event={event}
        />
        {dreams.length ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {dreams.map((dream) => (
              <Link
                href="/[event]/[dream]"
                as={`/${event.slug}/${dream.id}`}
                key={dream.id}
              >
                <a className="flex focus:outline-none focus:ring rounded-lg">
                  <DreamCard dream={dream} event={event} />
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex-grow flex flex-col justify-center items-center h-64">
            <h1 className="text-3xl text-gray-500 text-center ">
              No {dreamName(currentOrg)}s...
            </h1>
          </div>
        )}
        <LoadMore
          moreExist={moreExist}
          loading={loading}
          onClick={() => fetchMore({ variables: { offset: dreams.length } })}
        />
      </div>
    </>
  );
};

export default EventPage;
