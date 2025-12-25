import FormattedCurrency from "components/FormattedCurrency";
import HappySpinner from "components/HappySpinner";
import { HeaderSkeleton } from "components/Skeleton";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { gql, useMutation, useQuery } from "urql";
import BucketCard from "../../../components/BucketCard";
import Button from "../../../components/Button";
import EditableField from "../../../components/EditableField";
import Filterbar from "../../../components/Filterbar";
import LoadMore from "../../../components/LoadMore";
import NewBucketModal from "../../../components/NewBucketModal";
import PageHero from "../../../components/PageHero";
import SubMenu from "../../../components/SubMenu";
import Table from "../../../components/Table";

const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($roundId: ID!) {
    acceptInvitation(roundId: $roundId) {
      id
      isAdmin
      isModerator
      isApproved
      hasJoined
      balance
      round {
        id
        title
        slug
        group {
          id
          slug
        }
      }
    }
  }
`;

export const ROUND_PAGE_QUERY = gql`
  query RoundPage($roundSlug: String!, $groupSlug: String) {
    round(roundSlug: $roundSlug, groupSlug: $groupSlug) {
      id
      slug
      title
      info
      color
      bucketCreationIsOpen
      grantingHasClosed
      totalInMembersBalances
      allowStretchGoals
      bucketReviewIsOpen
      currency
      tags {
        id
        value
      }
      group {
        id
        slug
        subscriptionStatus {
          isActive
        }
      }
      ocCollective {
        stats {
          balance {
            currency
            valueInCents
          }
        }
      }
      membersLimit {
        consumedPercentage
        currentCount
        limit
      }
      bucketsLimit {
        consumedPercentage
        currentCount
        limit
        isLimitOver
        status
      }
      ocWebhookUrl
      bucketStatusCount {
        PENDING_APPROVAL
        OPEN_FOR_FUNDING
        IDEA
        FUNDED
        CANCELED
        COMPLETED
      }
    }
  }
`;

export const PINNED_BUCKETS_QUERY = gql`
  query PinnedBuckets(
    $groupSlug: String
    $roundSlug: String!
    $status: [StatusType!]
  ) {
    bucketsPage(
      groupSlug: $groupSlug
      roundSlug: $roundSlug
      status: $status
      limit: 1000
    ) {
      buckets {
        id
        description
        summary
        pinnedAt
        title
        minGoal
        maxGoal
        flags {
          type
        }
        noOfFunders
        income
        awardedAmount
        totalContributions
        totalContributionsFromCurrentMember
        noOfComments
        published
        approved
        canceled
        status
        percentageFunded
        round {
          canCocreatorStartFunding
        }
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
        pinnedAt
        title
        minGoal
        maxGoal
        flags {
          type
        }
        noOfFunders
        income
        awardedAmount
        totalContributions
        totalContributionsFromCurrentMember
        noOfComments
        published
        approved
        canceled
        status
        percentageFunded
        round {
          canCocreatorStartFunding
        }
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

function AcceptInvitationModal({
  isOpen,
  onClose,
  onAccept,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed z-50 top-0 left-0 w-screen h-screen bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 w-11/12 md:w-1/2">
        <h2 className="text-xl font-semibold mb-4">You have an invitation!</h2>
        <p className="mb-6">
          You’ve been invited to participate in this round. Accept your
          invitation to get access to all round features.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-200"
          >
            Maybe Later
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-2 bg-anthracit text-white rounded-md hover:bg-anthracit-dark"
          >
            Accept Invitation
          </button>
        </div>
      </div>
    </div>
  );
}

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
  pinnedBuckets,
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
        orderDir: "desc",
      }),
      ...(!!s && { textSearchTerm: s }),
      ...(!!tag && { tag }),
    },
  });

  const moreExist = data?.bucketsPage.moreExist;
  const buckets = data?.bucketsPage.buckets ?? [];
  let finalBuckets = buckets;
  if (!bucketTableView) {
    if (isFirstPage && pinnedBuckets && pinnedBuckets.length > 0) {
      // On page 1, merge all pinned buckets (fetched separately) with unpinned ones from this page.
      const unpinned = buckets.filter((b) => b.pinnedAt === null);
      finalBuckets = [...pinnedBuckets, ...unpinned];
    } else {
      // On subsequent pages, show only unpinned buckets.
      finalBuckets = buckets.filter((b) => b.pinnedAt === null);
    }
  }

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
            className="underline cursor-pointer text-ellipsis focus:outline-none focus:ring rounded"
          >
            {cell.value.substr(0, 20) + (cell.value.length > 20 ? "..." : "")}
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
        Cell: ({ cell }) => Math.floor(cell.value) + "%",
      },
      {
        Header: "Funders",
        accessor: "fundersCount",
      },
    ];

    if (round?.bucketReviewIsOpen) {
      cols.push({
        Header: "Approvals",
        accessor: "goodFlagCount",
      });
      cols.push({
        Header: "Flags",
        accessor: "raiseFlagCount",
      });
    }

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
    round?.bucketReviewIsOpen,
  ]);

  if (error) {
    console.error(error);
  }

  return (
    <>
      {!bucketTableView ? (
        finalBuckets.map((bucket) => (
          <Link
            key={bucket.id}
            href={{
              pathname: "/[group]/[round]/[bucketId]",
              query: {
                ...router.query,
                group: round.group?.slug ?? "c",
                round: round.slug,
                bucketId: bucket.id,
                f: statusFilter,
              },
            }}
            shallow
            scroll={false}
            className="flex focus:outline-none focus:ring rounded-lg"
          >
            <BucketCard bucket={bucket} round={round} />
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
            totalFunding: bucket.totalContributions,
            externalFunding: bucket.income || 0,
            goodFlagCount: bucket.flags.filter(
              (f) => f.type === "ALL_GOOD_FLAG"
            ).length,
            raiseFlagCount: bucket.flags.filter((f) => f.type === "RAISE_FLAG")
              .length,
            fundersCount: bucket.noOfFunders || 0,
            internalFunding: bucket.totalContributions || 0,
            fundsNeeded:
              bucket.minGoal - bucket.totalContributions > 0
                ? bucket.minGoal - bucket.totalContributions
                : 0,
            progress:
              Math.floor(
                ((bucket.totalContributions || 0) / (bucket.minGoal || 1)) *
                  10000
              ) / 100,
            stretchGoalProgress:
              round.allowStretchGoals && bucket.maxGoal
                ? bucket.maxGoal - bucket.minGoal > 0
                  ? ((bucket.totalContributions || 0) / (bucket.maxGoal || 1)) *
                    100
                  : 0
                : 0,
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
    bucketStatusCount["OPEN_FOR_FUNDING"] ||
    bucketStatusCount["IDEA"]
  ) {
    if (bucketStatusCount["PENDING_APPROVAL"])
      stdFilter.push("PENDING_APPROVAL");
    if (bucketStatusCount["OPEN_FOR_FUNDING"])
      stdFilter.push("OPEN_FOR_FUNDING");
    if (bucketStatusCount["IDEA"]) stdFilter.push("IDEA");
  } else {
    // otherwise show every other
    const statusNames = Object.keys(bucketStatusCount);
    const values = Object.values(bucketStatusCount);
    stdFilter = statusNames
      //.filter((status, i) => !!values[i])
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
    const userFilter = stringOrArrayIntoArray(f);

    // If user hasn't selected anything (userFilter = []) and the round ended:
    if (round?.grantingHasClosed && userFilter.length === 0) {
      // Just default to ["FUNDED"], but still allow the user to change it afterwards
      setStatusFilter(["FUNDED"]);
      return;
    }

    // Otherwise, either use the user’s filter if present or fall back to your standard logic
    const fallback = getStandardFilter(bucketStatusCount);
    setStatusFilter(userFilter.length > 0 ? userFilter : fallback);
  }, [bucketStatusCount, f, round?.grantingHasClosed]);

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
    if (router.isReady && router.query.view !== "table") {
      const page = parseInt(router.query.page as string);
      if (!isNaN(page)) {
        const pageVariables = new Array(page)
          .fill(0)
          .map((_, i) => ({ limit: limit, offset: i * limit }));
        setPageVariables(pageVariables);
      }
      setPause(false);
    }
  }, [router.isReady, router.query.page, router.query.view]);

  const [{ data: pinnedData }] = useQuery({
    query: PINNED_BUCKETS_QUERY,
    variables: {
      groupSlug: router.query.group,
      roundSlug: router.query.round,
      status: statusFilter,
    },
    pause: !router.isReady || bucketTableView,
  });
  const pinnedBuckets = (pinnedData?.bucketsPage?.buckets ?? [])
    .filter((b) => b.pinnedAt !== null)
    .sort(
      (a, b) => new Date(a.pinnedAt).getTime() - new Date(b.pinnedAt).getTime()
    );

  const [invitationModalOpen, setInvitationModalOpen] = useState(false);
  const [, acceptInvitation] = useMutation(ACCEPT_INVITATION);

  useEffect(() => {
    if (
      currentUser?.currentCollMember?.isApproved &&
      currentUser?.currentCollMember?.hasJoined === false
    ) {
      setInvitationModalOpen(true);
    }
  }, [currentUser]);

  const handleAcceptInvitation = () => {
    acceptInvitation({ roundId: round?.id }).then(({ data, error }) => {
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Invitation Accepted");
        setInvitationModalOpen(false);
        // Optionally refetch or update the currentUser data here.
      }
    });
  };

  if (pause || fetching) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <HappySpinner />
      </div>
    );
  }

  if (
    !round &&
    !fetching &&
    router.isReady &&
    router.query["invitation_through"] === "email"
  ) {
    return (
      <div className="w-full flex justify-center items-center h-96 flex-col gap-4">
        <span className="font-medium text-gray-800">
          <FormattedMessage defaultMessage="You have been invited to this round. To accept this invitation, please log in or sign up." />
        </span>
        <span className="flex gap-4">
          <Link href={`/login?r=${router.asPath}`}>
            <span className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md cursor-pointer hover:bg-gray-100">
              <FormattedMessage defaultMessage="Log in" />
            </span>
          </Link>
          <Link href={`/signup?r=${router.asPath}`}>
            <span className="px-4 py-2 bg-gray-800 text-white font-medium rounded-md cursor-pointer hover:bg-gray-700">
              <FormattedMessage defaultMessage="Sign up" />
            </span>
          </Link>
        </span>
      </div>
    );
  }

  if (!round && !fetching && router.isReady) {
    return (
      <div className="text-center mt-7">
        <FormattedMessage defaultMessage="This round either doesn't exist or you don't have access to it" />
      </div>
    );
  }

  const canEdit =
    currentUser?.currentGroupMember?.isAdmin ||
    currentUser?.currentCollMember?.isAdmin;
  const actionsAreDisabled = round?.membersLimit.currentCount >= round?.membersLimit.limit;
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
                canEdit={canEdit && !actionsAreDisabled}
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
            <div className="p-3 mb-5 bg-gray-50 shadow-md rounded-md">
              <p className="font-bold my-0.5">
                <FormattedMessage defaultMessage="Funds available" />
              </p>
              <div>
                <table>
                  <tbody>
                    {currentUser?.currentCollMember?.isApproved &&
                      currentUser?.currentCollMember?.hasJoined && (
                        <tr>
                          <td className="pr-3">
                            <FormattedMessage defaultMessage="In your account" />
                          </td>
                          <td className="font-bold">
                            <FormattedCurrency
                              value={currentUser.currentCollMember.balance}
                              currency={round.currency}
                            />
                          </td>
                        </tr>
                      )}
                    <tr>
                      <td className="pr-3">
                        <FormattedMessage defaultMessage="In this round" />
                      </td>
                      <td className="font-bold">
                        <FormattedCurrency
                          value={round.totalInMembersBalances}
                          currency={round.currency}
                        />
                      </td>
                    </tr>
                    {round?.ocCollective && (
                      <tr>
                        <td className="pr-3">
                          <FormattedMessage defaultMessage="Open Collective" />
                        </td>
                        <td className="font-bold">
                          <FormattedCurrency
                            value={
                              round?.ocCollective?.stats?.balance?.valueInCents
                            }
                            currency={
                              round?.ocCollective?.stats?.balance?.currency
                            }
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {round?.bucketCreationIsOpen &&
              currentUser?.currentCollMember?.isApproved &&
              currentUser?.currentCollMember?.hasJoined && (
                <>
                  <Button
                    size="large"
                    color={round.color}
                    onClick={() => {
                      if (round.group?.subscriptionStatus === false) {
                        const event = new CustomEvent(
                          "show-upgrade-group-message",
                          { detail: { groupId: round?.group?.id } }
                        );
                        window.dispatchEvent(event);
                        return;
                      }
                      setNewBucketModalOpen(true);
                    }}
                    testid="create-new-bucket-button"
                    disabled={actionsAreDisabled}
                  >
                    <FormattedMessage defaultMessage="New" />{" "}
                    {process.env.BUCKET_NAME_SINGULAR}
                  </Button>
                  {newBucketModalOpen && (
                    <NewBucketModal
                      round={round}
                      handleClose={() => setNewBucketModalOpen(false)}
                      router={router}
                      bucketsLimit={round.bucketsLimit}
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
          data-testid="buckets-view"
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
                pinnedBuckets={i === 0 ? pinnedBuckets : []}
              />
            );
          })}
        </div>
      </div>
      <AcceptInvitationModal
        isOpen={invitationModalOpen}
        onClose={() => setInvitationModalOpen(false)}
        onAccept={handleAcceptInvitation}
      />
    </div>
  );
};

export default RoundPage;
