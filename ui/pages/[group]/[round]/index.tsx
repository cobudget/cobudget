import { useEffect, useMemo, useState } from "react";
import { useQuery, gql, ssrExchange } from "urql";
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
import { useRouter } from "next/router";
import HappySpinner from "components/HappySpinner";
import { HeaderSkeleton } from "components/Skeleton";
import { initUrqlClient } from "next-urql";
import { client as createClientConfig } from "graphql/client";
import prisma from "server/prisma";
import { TOP_LEVEL_QUERY } from "pages/_app";
import Table from "../../../components/Table";
import { FormattedNumber } from "react-intl";

export const ROUND_PAGE_QUERY = gql`
  query RoundPage($roundSlug: String!, $groupSlug: String) {
    round(roundSlug: $roundSlug, groupSlug: $groupSlug) {
      id
      slug
      title
      info
      color
      bucketCreationIsOpen
      totalInMembersBalances
      allowStretchGoals
      currency
      tags {
        id
        value
      }
      group {
        id
        slug
      }
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
    $groupSlug: String
    $roundSlug: String!
    $textSearchTerm: String
    $tag: String
    $offset: Int
    $limit: Int
    $status: [StatusType!]
    $orderBy: String
    $orderDir: String
  ) {
    bucketsPage(
      groupSlug: $groupSlug
      roundSlug: $roundSlug
      textSearchTerm: $textSearchTerm
      tag: $tag
      offset: $offset
      limit: $limit
      status: $status
      orderBy: $orderBy
      orderDir: $orderDir
    ) {
      moreExist
      buckets {
        id
        description
        summary
        title
        minGoal
        maxGoal
        flags {
          type
        }
        noOfFunders
        income
        totalContributions
        totalContributionsFromCurrentMember
        noOfComments
        published
        approved
        canceled
        status
        percentageFunded
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
  statusFilter,
  currentUser,
  loading,
  bucketTableView,
  pause,
  orderBy,
}) => {
  const { tag, s } = router.query;

  const [{ data, fetching, error }] = useQuery({
    query: BUCKETS_QUERY,
    pause,
    variables: {
      groupSlug: router.query.group,
      roundSlug: router.query.round,
      offset: variables.offset,
      limit: variables.limit,
      status: statusFilter,
      ...(orderBy && {
        orderBy,
        orderDir: "asc",
      }),
      ...(!!s && { textSearchTerm: s }),
      ...(!!tag && { tag }),
    },
  });

  const moreExist = data?.bucketsPage.moreExist;
  const buckets = data?.bucketsPage.buckets ?? [];

  const columns = useMemo(() => {
    const cols = [
      {
        Header: "Title",
        accessor: "title",
        Cell: ({ cell }) => (
          <Link
            href={`/${round?.group?.slug ?? "c"}/${round?.slug}/${
              cell.row.original?.id
            }`}
          >
            <span className="underline cursor-pointer text-ellipsis">
              {cell.value.substr(0, 20) + (cell.value.length > 20 ? "..." : "")}
            </span>
          </Link>
        ),
      },
      {
        Header: "Goal",
        accessor: "minGoal",
        Cell: ({ cell }) => (
          <FormattedNumber
            value={cell.value / 100}
            style="currency"
            currencyDisplay={"symbol"}
            currency={round?.currency}
          />
        ),
      },
      {
        Header: "Resources",
        accessor: "externalFunding",
        Cell: ({ cell }) => (
          <FormattedNumber
            value={cell.value / 100}
            style="currency"
            currencyDisplay={"symbol"}
            currency={round?.currency}
          />
        ),
      },
      {
        Header: "Funded",
        accessor: "internalFunding",
        Cell: ({ cell }) => (
          <FormattedNumber
            value={cell.value / 100}
            style="currency"
            currencyDisplay={"symbol"}
            currency={round?.currency}
          />
        ),
      },
      /*{
        Header: "Total",
        accessor: "totalFunding",
        Cell: ({ cell }) => (
          <FormattedNumber
            value={cell.value / 100}
            style="currency"
            currencyDisplay={"symbol"}
            currency={round?.currency}
          />
        ),
      },*/
      {
        Header: "Needed",
        accessor: "fundsNeeded",
        Cell: ({ cell }) => (
          <FormattedNumber
            value={cell.value / 100}
            style="currency"
            currencyDisplay={"symbol"}
            currency={round?.currency}
          />
        ),
      },
      {
        Header: "Progress",
        accessor: "progress",
        Cell: ({ cell }) => Math.round(cell.value) + "%",
      },
      {
        Header: "Funders",
        accessor: "fundersCount",
      },
      {
        Header: "Approvals",
        accessor: "goodFlagCount",
      },
      {
        Header: "Flags",
        accessor: "raiseFlagCount",
      },
    ];

    /* 
    if (currentUser) {
      cols.splice(round?.allowStretchGoals ? 3 : 2, 0, {
        Header: "Your Contribution",
        accessor: "myFunding",
        Cell: ({ cell }) => (
          <FormattedNumber
            value={cell.value / 100}
            style="currency"
            currencyDisplay={"symbol"}
            currency={round?.currency}
          />
        ),
      });
    }
    */

    if (round?.allowStretchGoals) {
      cols.splice(7, 0, {
        Header: "Stretch Progress",
        accessor: "stretchGoalProgress",
        Cell: ({ cell }) => Math.round(cell.value) + "%",
      });
      cols.splice(2, 0, {
        Header: "Stretch Goal",
        accessor: "stretchGoal",
        Cell: ({ cell }) => (
          <FormattedNumber
            value={Math.round(Math.round(cell.value / 100))}
            style="currency"
            currencyDisplay={"symbol"}
            currency={round?.currency}
          />
        ),
      });
    }

    return cols;
  }, [
    round?.currency,
    round?.allowStretchGoals,
    round?.group?.slug,
    round?.slug,
  ]);

  if (error) {
    console.error(error);
  }

  return (
    <>
      {!bucketTableView ? (
        buckets.map((bucket) => (
          <Link
            href={`/${round.group?.slug ?? "c"}/${round.slug}/${bucket.id}`}
            key={bucket.id}
          >
            <a className="flex focus:outline-none focus:ring rounded-lg">
              <BucketCard bucket={bucket} round={round} />
            </a>
          </Link>
        ))
      ) : !loading ? (
        <Table
          columns={columns}
          data={buckets.map((bucket) => ({
            id: bucket.id,
            title: bucket.title,
            minGoal: bucket.minGoal,
            stretchGoal: round?.allowStretchGoals ? bucket.maxGoal : "-",
            myFunding: bucket.totalContributionsFromCurrentMember,
            totalFunding: bucket.totalContributions + bucket.income,
            externalFunding: bucket.income || 0,
            goodFlagCount: bucket.flags.filter(
              (f) => f.type === "ALL_GOOD_FLAG"
            ).length,
            raiseFlagCount: bucket.flags.filter((f) => f.type === "RAISE_FLAG")
              .length,
            fundersCount: bucket.noOfFunders || 0,
            internalFunding: bucket.totalContributions || 0,
            fundsNeeded:
              bucket.minGoal - bucket.income - bucket.totalContributions > 0
                ? bucket.minGoal - bucket.income - bucket.totalContributions
                : 0,
            progress:
              Math.floor(
                ((bucket.income + bucket.totalContributions || 0) /
                  (bucket.minGoal || 1)) *
                  10000
              ) / 100,
            stretchGoalProgress:
              round.allowStretchGoals && bucket.maxGoal
                ? bucket.maxGoal - bucket.minGoal > 0
                  ? ((bucket.income + bucket.totalContributions || 0) /
                      (bucket.maxGoal || 1)) *
                    100
                  : 0
                : "-",
          }))}
        />
      ) : null}

      {isFirstPage &&
        buckets.length === 0 &&
        (!fetching ? (
          <div className="absolute w-full flex justify-center items-center h-20">
            <h1 className="text-3xl text-gray-500 text-center mt-10 mb-20">
              No {process.env.BUCKET_NAME_PLURAL}...
            </h1>
          </div>
        ) : (
          <div className="w-full flex justify-center items-center h-64">
            <HappySpinner />
          </div>
          // <div className="bg-white rounded-lg shadow-md animate-pulse overflow-hidden">
          //   <div className="bg-anthracit h-48"></div>
          //   <div className="animate-pulse flex space-x-4 p-4">
          //     <div className="flex-1 space-y-4 py-1">
          //       <div className="h-4 bg-gray-400 rounded w-3/4"></div>
          //       <div className="space-y-2">
          //         <div className="h-4 bg-gray-400 rounded"></div>
          //         <div className="h-4 bg-gray-400 rounded w-5/6"></div>
          //       </div>
          //     </div>
          //   </div>
          // </div>
        ))}
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
    stdFilter = statusNames
      .filter((status, i) => !!values[i])
      .filter((status) => status !== "__typename");
  }
  return stdFilter;
};

const RoundPage = ({ currentUser }) => {
  const limit = 12;
  const [newBucketModalOpen, setNewBucketModalOpen] = useState(false);
  const [bucketTableView, setBucketTableView] = useState(false);
  const [pageVariables, setPageVariables] = useState([
    { limit: limit, offset: 0 },
  ]);
  const [pause, setPause] = useState(true);
  const [sortBy, setSortBy] = useState<string>();
  const router = useRouter();

  const [
    { data: { round } = { round: null }, fetching, error, stale },
  ] = useQuery({
    query: ROUND_PAGE_QUERY,
    pause,
    variables: {
      roundSlug: router.query.round,
      groupSlug: router.query.group,
    },
  });

  const [bucketStatusCount, setBucketStatusCount] = useState(
    round?.bucketStatusCount ?? {}
  );

  const { tag, s, f } = router.query;
  const [statusFilter, setStatusFilter] = useState(
    stringOrArrayIntoArray(f ?? getStandardFilter(bucketStatusCount))
  );

  useEffect(() => {
    setStatusFilter(stringOrArrayIntoArray(f));
  }, [f]);

  useEffect(() => {
    setBucketStatusCount(round?.bucketStatusCount ?? {});
  }, [round?.bucketStatusCount]);

  // apply standard filter (hidden from URL)
  useEffect(() => {
    const filter = f ?? getStandardFilter(bucketStatusCount);
    setStatusFilter(stringOrArrayIntoArray(filter));
  }, [bucketStatusCount, f]);

  useEffect(() => {
    setBucketTableView(router.query.view === "table");
    if (router.query.view === "table") {
      setPageVariables([{ offset: 0, limit: 1000 }]);
    }
  }, [router?.asPath, router?.query?.view]);

  useEffect(() => {
    if (router.query.round && router.query.group && pause) {
      setPause(false);
    }
  }, [router.query.round, router.query.group, pause]);

  useEffect(() => {
    if (router.isReady) {
      const page = parseInt(router.query.page as string);
      if (!isNaN(page)) {
        const pageVariables = new Array(page)
          .fill(0)
          .map((_, i) => ({ limit: limit, offset: i * limit }));
        setPageVariables(pageVariables);
      }
      setPause(false);
    }
  }, [router.isReady, router.query.page]);

  if (pause || fetching) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <HappySpinner />
      </div>
    );
  }

  if (!round && !fetching && router.isReady) {
    return (
      <div className="text-center mt-7">
        This round either doesn&apos;t exist or you don&apos;t have access to it
      </div>
    );
  }

  const canEdit =
    currentUser?.currentGroupMember?.isAdmin ||
    currentUser?.currentCollMember?.isAdmin;
  return (
    <div>
      <SubMenu currentUser={currentUser} round={round} />
      <PageHero>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="col-span-2">
            {round ? (
              <EditableField
                defaultValue={round.info}
                name="info"
                label="Add message"
                placeholder={`# Welcome to ${round.title}'s bucket page`}
                canEdit={canEdit}
                className="h-10"
                MUTATION={gql`
                  mutation EditHomepageMessage($roundId: ID!, $info: String) {
                    editRound(roundId: $roundId, info: $info) {
                      id
                      info
                    }
                  }
                `}
                variables={{ roundId: round.id }}
                required
              />
            ) : (
              <HeaderSkeleton />
            )}
          </div>
          <div className={`flex flex-col justify-end items-start`}>
            {round?.bucketCreationIsOpen &&
              currentUser?.currentCollMember?.isApproved &&
              currentUser?.currentCollMember?.hasJoined && (
                <>
                  <div className="p-3 mb-5 bg-gray-50 shadow-md rounded-md">
                    <p className="font-bold my-0.5">Funds available</p>
                    <div>
                      <table>
                        <tbody>
                          <tr>
                            <td className="pr-3">In your account</td>
                            <td className="font-bold">
                              {currentUser.currentCollMember.balance / 100}
                              {getCurrencySymbol(round.currency)}
                            </td>
                          </tr>
                          <tr>
                            <td className="pr-3">In this round</td>
                            <td className="font-bold">
                              {round.totalInMembersBalances / 100}
                              {getCurrencySymbol(round.currency)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <Button
                    size="large"
                    color={round.color}
                    onClick={() => setNewBucketModalOpen(true)}
                  >
                    New {process.env.BUCKET_NAME_SINGULAR}
                  </Button>
                  {newBucketModalOpen && (
                    <NewBucketModal
                      round={round}
                      handleClose={() => setNewBucketModalOpen(false)}
                      router={router}
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
          textSearchTerm={s}
          tag={tag}
          statusFilter={statusFilter}
          bucketStatusCount={bucketStatusCount}
          view={bucketTableView ? "table" : "grid"}
          currentUser={currentUser}
          sortBy={sortBy}
          onChangeSortBy={(e) => setSortBy(e.target.value)}
        />
        <div
          className={
            bucketTableView
              ? ""
              : "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 relative pb-20"
          }
        >
          {pageVariables.map((variables, i) => {
            return (
              <Page
                pause={pause}
                router={router}
                round={round}
                key={"" + variables.limit + i}
                variables={variables}
                isFirstPage={i === 0}
                isLastPage={i === pageVariables.length - 1}
                currentUser={currentUser}
                onLoadMore={({ limit, offset }) => {
                  router.push(
                    {
                      pathname: "/[group]/[round]",
                      query: {
                        ...router.query,
                        page: Math.floor(offset / limit) + 1,
                      },
                    },
                    undefined,
                    { shallow: true, scroll: false }
                  );
                  setPageVariables([...pageVariables, { limit, offset }]);
                }}
                statusFilter={statusFilter}
                loading={fetching}
                bucketTableView={bucketTableView}
                orderBy={sortBy}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// export async function getStaticProps(ctx) {
//   const ssrCache = ssrExchange({
//     isClient: false,
//   });
//   const client = initUrqlClient(createClientConfig(ssrCache), false);

//   // This query is used to populate the cache for the query
//   // used on this page.
//   const variables = {
//     groupSlug: ctx.params.group,
//     roundSlug: ctx.params.round,
//   };
//   console.log({ variables });

//   const roundPageQuery = await client
//     .query(ROUND_PAGE_QUERY, variables)
//     .toPromise();
//   console.log({ roundPageQuery });
//   // TODO: try to get static generation of bucket list to work (it does not revalidate)
//   // const statusFilter = stringOrArrayIntoArray(
//   //   getStandardFilter(data?.round?.bucketStatusCount ?? {})
//   // );
//   // await client
//   //   .query(BUCKETS_QUERY, {
//   //     ...variables,
//   //     offset: 0,
//   //     limit: limit,
//   //     status: statusFilter,
//   //   })
//   //   .toPromise();

//   const topLevelQuery = await client
//     .query(TOP_LEVEL_QUERY, variables)
//     .toPromise();
//   console.log({ topLevelQuery });

//   return {
//     props: {
//       // urqlState is a keyword here so withUrqlClient can pick it up.
//       urqlState: ssrCache.extractData(),
//     },
//     revalidate: 60,
//   };
// }

// export async function getStaticPaths() {
//   const rounds = await prisma.round.findMany({
//     where: { visibility: "PUBLIC" },
//     include: { group: true },
//   });

//   return {
//     // paths: rounds.map((round) => ({
//     //   params: { group: round.group.slug, round: round.slug },
//     // })),
//     paths: [],
//     fallback: true, // false or 'blocking'
//   };
// }

export default RoundPage;
