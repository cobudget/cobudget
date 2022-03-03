import { useEffect, useState } from "react";
import { useQuery, gql } from "urql";
import Link from "next/link";
import BucketCard from "../../../components/BucketCard";
import Filterbar from "../../../components/Filterbar";
import SubMenu from "../../../components/SubMenu";
import PageHero from "../../../components/PageHero";
import Button from "../../../components/Button";
import NewBucketModal from "../../../components/NewBucketModal";
import EditableField from "../../../components/EditableField";
import LoadMore from "../../../components/LoadMore";
import getCurrencySymbol from "utils/getCurrencySymbol";

export const BUCKET_STATUS_QUERY = gql`
  query BucketStatus($roundSlug: String!, $orgSlug: String) {
    round(roundSlug: $roundSlug, orgSlug: $orgSlug) {
      id
      bucketStatusCount {
        PENDING_APPROVAL
        OPEN_FOR_FUNDING
        FUNDED
        CANCELED
        COMPLETED
      }
    }
  }
`;

export const BUCKETS_QUERY = gql`
  query Buckets(
    $roundId: ID!
    $textSearchTerm: String
    $tag: String
    $offset: Int
    $limit: Int
    $status: [StatusType!]
  ) {
    bucketsPage(
      roundId: $roundId
      textSearchTerm: $textSearchTerm
      tag: $tag
      offset: $offset
      limit: $limit
      status: $status
    ) {
      moreExist
      buckets {
        id
        description
        summary
        title
        minGoal
        maxGoal
        income
        totalContributions
        noOfComments
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
  round,
  org,
  statusFilter,
}) => {
  const { tag, s } = router.query;

  const [{ data, fetching, error }] = useQuery({
    query: BUCKETS_QUERY,
    variables: {
      roundId: round.id,
      offset: variables.offset,
      limit: variables.limit,
      status: statusFilter,
      ...(!!s && { textSearchTerm: s }),
      ...(!!tag && { tag }),
    },
  });

  const moreExist = data?.bucketsPage.moreExist;
  const buckets = data?.bucketsPage.buckets ?? [];

  if (error) {
    console.error(error);
  }

  return (
    <>
      {buckets.map((bucket) => (
        <Link
          href={`/${org?.slug ?? "c"}/${round.slug}/${bucket.id}`}
          key={bucket.id}
        >
          <a className="flex focus:outline-none focus:ring rounded-lg">
            <BucketCard
              bucket={bucket}
              round={round}
              currentOrg={org}
            />
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

const stringOrArrayIntoArray = (stringOrArray) => {
  if (stringOrArray instanceof Array) return stringOrArray;
  return stringOrArray ? [stringOrArray] : [];
};

const getStandardFilter = (bucketStatusCount) => {
  let stdFilter = [];

  // if there is either pending or open for funding buckets, show those categories
  if (
    bucketStatusCount["PENDING_APPROVAL"] ||
    bucketStatusCount["OPEN_FOR_FUNDING"]
  ) {
    if (bucketStatusCount["PENDING_APPROVAL"])
      stdFilter.push("PENDING_APPROVAL");
    if (bucketStatusCount["OPEN_FOR_FUNDING"])
      stdFilter.push("OPEN_FOR_FUNDING");
  } else {
    // otherwise show every other
    const statusNames = Object.keys(bucketStatusCount);
    const values = Object.values(bucketStatusCount);
    stdFilter = statusNames.filter((status, i) => !!values[i]);
  }
  return stdFilter;
};

const RoundPage = ({ round, router, currentOrg, currentUser }) => {
  const [newBucketModalOpen, setNewBucketModalOpen] = useState(false);
  const [pageVariables, setPageVariables] = useState([
    { limit: 12, offset: 0 },
  ]);
  const [{ data }] = useQuery({
    query: BUCKET_STATUS_QUERY,
    variables: {
      roundSlug: round?.slug,
      orgSlug: currentOrg?.slug ?? "c",
    },
  });

  const [bucketStatusCount] = useState(data?.round?.bucketStatusCount ?? {});

  const { tag, s, f } = router.query;
  const [statusFilter, setStatusFilter] = useState(stringOrArrayIntoArray(f));

  useEffect(() => {
    setStatusFilter(stringOrArrayIntoArray(f));
  }, [f]);

  useEffect(() => {
    setStatusFilter(data?.round?.bucketStatusCount ?? {});
  }, [data]);

  // apply standard filter (hidden from URL)
  useEffect(() => {
    const filter = f ?? getStandardFilter(bucketStatusCount);
    setStatusFilter(stringOrArrayIntoArray(filter));
  }, [bucketStatusCount]);

  if (!round) return null;
  const canEdit =
    currentUser?.currentOrgMember?.isAdmin ||
    currentUser?.currentCollMember?.isAdmin;
  return (
    <div>
      <SubMenu currentUser={currentUser} round={round} />
      <PageHero>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="col-span-2">
            <EditableField
              defaultValue={round.info}
              name="info"
              label="Add homepage message"
              placeholder={`# Welcome to ${round.title}'s bucket page`}
              canEdit={canEdit}
              className="h-10"
              MUTATION={gql`
                mutation EditHomepageMessage(
                  $roundId: ID!
                  $info: String
                ) {
                  editRound(roundId: $roundId, info: $info) {
                    id
                    info
                  }
                }
              `}
              variables={{ roundId: round.id }}
              required
            />
          </div>
          <div className={`flex flex-col justify-end items-start`}>
            {round.bucketCreationIsOpen &&
              currentUser?.currentCollMember?.isApproved &&
              currentUser?.currentCollMember?.hasJoined && (
                <>
                  
                  <p className="font-bold my-0.5">
                    Your Funds
                  </p>
                  <p className="mb-5">
                    <span className="font-bold">{currentUser.currentCollMember.balance / 100} {getCurrencySymbol(round.currency)}</span>{" "}
                    <span>({currentUser.currentCollMember.amountContributed / 100} {getCurrencySymbol(round.currency)} in round)</span>
                  </p>
                  
                  <Button
                    size="large"
                    color={round.color}
                    onClick={() => setNewBucketModalOpen(true)}
                  >
                    New bucket
                  </Button>
                  {newBucketModalOpen && (
                    <NewBucketModal
                      round={round}
                      handleClose={() => setNewBucketModalOpen(false)}
                      currentOrg={currentOrg}
                    />
                  )}
                </>
              )}
          </div>
        </div>
      </PageHero>

      <div className="page flex-1">
        <Filterbar
          round={round}
          currentOrg={currentOrg}
          textSearchTerm={s}
          tag={tag}
          statusFilter={statusFilter}
          bucketStatusCount={bucketStatusCount}
        />
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 relative pb-20">
          {pageVariables.map((variables, i) => {
            return (
              <Page
                org={currentOrg}
                router={router}
                round={round}
                key={"" + variables.limit + i}
                variables={variables}
                isFirstPage={i === 0}
                isLastPage={i === pageVariables.length - 1}
                onLoadMore={({ limit, offset }) => {
                  setPageVariables([...pageVariables, { limit, offset }]);
                }}
                statusFilter={statusFilter}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoundPage;
