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

export const DREAMS_QUERY = gql`
  query Dreams(
    $orgSlug: String!
    $eventSlug: String!
    $textSearchTerm: String
    $tag: String
    $offset: Int
    $limit: Int
  ) {
    dreamsPage(
      orgSlug: $orgSlug
      eventSlug: $eventSlug
      textSearchTerm: $textSearchTerm
      tag: $tag
      offset: $offset
      limit: $limit
    ) {
      moreExist
      dreams {
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

const Page = ({
  variables,
  isLastPage,
  isFirstPage,
  onLoadMore,
  router,
  event,
  org,
}) => {
  const { tag, s } = router.query;

  const [{ data, fetching, error }] = useQuery({
    query: DREAMS_QUERY,
    variables: {
      orgSlug: router.query.org,
      eventSlug: router.query.collection,
      offset: variables.offset,
      limit: variables.limit,
      ...(!!s && { textSearchTerm: s }),
      ...(!!tag && { tag }),
    },
  });

  const moreExist = data?.dreamsPage.moreExist;
  const buckets = data?.dreamsPage.dreams ?? [];

  if (error) {
    console.error(error);
  }

  return (
    <>
      {buckets.map((bucket) => (
        <Link href={`/${org.slug}/${event.slug}/${bucket.id}`} key={bucket.id}>
          <a className="flex focus:outline-none focus:ring rounded-lg">
            <DreamCard dream={bucket} event={event} />
          </a>
        </Link>
      ))}
      {isFirstPage && buckets.length === 0 && !fetching && (
        <div className="absolute w-full flex justify-center items-center h-64">
          <h1 className="text-3xl text-gray-500 text-center ">No buckets...</h1>
        </div>
      )}
      {isLastPage && moreExist && (
        <div className="absolute bottom-0 justify-center flex w-full">
          <LoadMore
            moreExist={moreExist}
            loading={fetching}
            onClick={() =>
              onLoadMore({
                limit: variables.limit,
                offset: variables.offset + buckets.length,
              })
            }
          />{" "}
        </div>
      )}
    </>
  );
};

const CollectionPage = ({ currentOrgMember, event, router, currentOrg }) => {
  const [newDreamModalOpen, setNewDreamModalOpen] = useState(false);
  const [pageVariables, setPageVariables] = useState([
    { limit: 12, offset: 0 },
  ]);
  const { tag, s } = router.query;

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
                  mutation EditHomepageMessage(
                    $orgId: ID!
                    $eventId: ID!
                    $info: String
                  ) {
                    editEvent(orgId: $orgId, eventId: $eventId, info: $info) {
                      id
                      info
                    }
                  }
                `}
                variables={{ orgId: currentOrg.id, eventId: event.id }}
              />
            </div>
            <div className="flex justify-end items-start">
              {event.bucketCreationIsOpen &&
                currentOrgMember?.currentEventMembership?.isApproved && (
                  <>
                    <Button
                      size="large"
                      color={event.color}
                      onClick={() => setNewDreamModalOpen(true)}
                    >
                      New bucket
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
        <Filterbar textSearchTerm={s} tag={tag} event={event} />
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 relative pb-20">
          {pageVariables.map((variables, i) => {
            return (
              <Page
                org={currentOrg}
                router={router}
                event={event}
                key={"" + variables.limit + i}
                variables={variables}
                isFirstPage={i === 0}
                isLastPage={i === pageVariables.length - 1}
                onLoadMore={({ limit, offset }) => {
                  setPageVariables([...pageVariables, { limit, offset }]);
                }}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CollectionPage;
