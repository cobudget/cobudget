import { useQuery, gql, ssrExchange } from "urql";
import { useState, useEffect, useMemo } from "react";
import EditImagesModal from "../../../../components/Bucket/EditImagesModal";
import Bucket from "../../../../components/Bucket";
import Overview from "../../../../components/Bucket/Overview";
import { Tab } from "@headlessui/react";
import Funders from "components/Bucket/Funders";
import Comments from "components/Bucket/Comments";

import classNames from "utils/classNames";
import Spinner from "components/Spinner";
import { useRouter } from "next/router";
import { initUrqlClient } from "next-urql";
import { client as createClientConfig } from "graphql/client";
import prisma from "server/prisma";
import { TOP_LEVEL_QUERY } from "pages/_app";
import capitalize from "utils/capitalize";
import Head from "next/head";
import Expenses from "components/Bucket/Expenses";
import { FormattedMessage } from "react-intl";

export const BUCKET_QUERY = gql`
  query Bucket($id: ID) {
    bucket(id: $id) {
      id
      pinnedAt
      description
      summary
      title
      minGoal
      maxGoal
      income
      totalContributions
      totalContributionsFromCurrentMember
      approved
      published
      completed
      createdAt
      completedAt
      funded
      fundedAt
      readyForFunding
      canceled
      canceledAt
      noOfComments
      noOfFunders
      status
      isFavorite

      directFundingEnabled
      directFundingType
      exchangeDescription
      exchangeMinimumContribution
      exchangeVat

      expenses {
        id
        ocMeta {
          legacyId
        }
        title
        amount
        status
        submittedBy
        ocId
        currency
        paidAt
        exchangeRate
      }

      round {
        id
        slug
        color
        currency
        allowStretchGoals
        bucketReviewIsOpen
        directFundingEnabled
        directFundingTerms
        grantingIsOpen
        grantingHasClosed
        maxAmountToBucketPerUser
        canCocreatorStartFunding
        canCocreatorEditOpenBuckets
        bucketsLimit {
          isLimitOver
          status
        }
        ocCollective {
          slug
          parent {
            slug
          }
        }
        guidelines {
          id
          title
          description
        }
        tags {
          id
          value
        }
        group {
          id
          slug
          discourseUrl
          subscriptionStatus {
            isActive
          }
        }
      }
      funders {
        id
        amount
        createdAt
        roundMember {
          id
          user {
            id
            name
            username
          }
        }
      }
      tags {
        id
        value
      }
      raisedFlags {
        id
        comment
        guideline {
          id
          title
        }
      }
      customFields {
        id
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
      cocreators {
        id

        user {
          id
          name
          username
          avatar
        }
      }
      images {
        id
        small
        large
      }
      discourseTopicUrl

      budgetItems {
        id
        description
        min
        max
        type
        position
      }
    }
  }
`;

function Header({ head }) {
  return (
    <Head>
      {/*meta tags for preview*/}
      <meta property="og:title" content={head?.title} />
      <meta property="og:image" content={head?.image} />
      <meta property="og:description" content={head?.description} />
      {/*Twitter card type*/}
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
}

const BucketIndex = ({ head, currentUser, currentGroup }) => {
  const router = useRouter();
  const [{ data, fetching, error }] = useQuery({
    query: BUCKET_QUERY,
    variables: { id: router.query.bucket },
  });

  const [editImagesModalOpen, setEditImagesModalOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const { bucket } = data ?? { bucket: null };
  const showBucketReview =
    currentUser?.currentCollMember?.isApproved &&
    bucket?.round?.bucketReviewIsOpen &&
    bucket?.round?.guidelines.length > 0 &&
    bucket?.published;

  const tabsList = useMemo(
    () => ["bucket", "comments", "funders", "expenses"],
    []
  );
  useEffect(() => {
    const index = tabsList.findIndex((tab) => tab === router.query.tab);
    setTab(index > -1 ? index : 0);
  }, [router.query.tab, tabsList]);

  const showExpensesTab =
    currentGroup?.experimentalFeatures &&
    (bucket?.status === "FUNDED" || bucket?.status === "COMPLETED");

  if ((!bucket && fetching) || !router.isReady) {
    return (
      <>
        <Header head={head} />
        <div className="flex-grow flex justify-center items-center h-64">
          <Spinner size="lg" className="text-gray-400" />
        </div>
      </>
    );
  }

  if (!bucket && !fetching)
    return (
      <>
        <Header head={head} />
        <div className="text-center mt-7">
          This {process.env.BUCKET_NAME_SINGULAR} either doesn&apos;t exist or
          you don&apos;t have access to it
        </div>
      </>
    );

  return (
    <>
      <Header head={head} />
      {/* EditImagesModal is here temporarily to work for both cover image and image thing, eventually we can make cover image its own thing. */}
      <EditImagesModal
        open={editImagesModalOpen}
        initialImages={bucket?.images}
        handleClose={() => setEditImagesModalOpen(false)}
        bucketId={bucket?.id}
      />
      <Overview
        bucket={bucket}
        fetching={fetching}
        error={error}
        currentUser={currentUser}
        currentGroup={currentGroup}
        showBucketReview={showBucketReview}
        openImageModal={() => setEditImagesModalOpen(true)}
      />
      <Tab.Group
        defaultIndex={tab}
        onChange={(tab) => {
          router.push(
            {
              pathname: router.pathname,
              query: { ...router.query, tab: tabsList[tab] },
            },
            undefined,
            { scroll: false }
          );
          setTab(tab);
        }}
      >
        <div className="bg-white border-b border-b-default">
          <Tab.List className="space-x-2 max-w-screen-xl mx-auto flex px-2 overflow-x-auto">
            <Tab
              className={({ selected }) =>
                classNames(
                  "block px-2 py-4 border-b-2 font-medium transition-colors",
                  selected
                    ? "border-anthracit text-anthracit"
                    : "border-transparent text-gray-500"
                )
              }
            >
              {capitalize(process.env.BUCKET_NAME_SINGULAR)}
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  "block px-2 py-4 border-b-2 font-medium transition-colors",
                  selected
                    ? "border-anthracit text-anthracit"
                    : "border-transparent text-gray-500"
                )
              }
            >
              <FormattedMessage defaultMessage="Comments" />{" "}
              {!bucket?.round?.group?.discourseUrl &&
                `(${bucket?.noOfComments})`}
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  "block px-2 py-4 border-b-2 font-medium transition-colors",
                  selected
                    ? "border-anthracit text-anthracit"
                    : "border-transparent text-gray-500"
                )
              }
            >
              <FormattedMessage defaultMessage="Funders" /> (
              {bucket?.noOfFunders})
            </Tab>
            {showExpensesTab ? (
              <Tab
                className={({ selected }) =>
                  classNames(
                    "block px-2 py-4 border-b-2 font-medium transition-colors",
                    selected
                      ? "border-anthracit text-anthracit"
                      : "border-transparent text-gray-500"
                  )
                }
              >
                <FormattedMessage defaultMessage="Expenses" />{" "}
                {bucket?.expenses?.length
                  ? `(${bucket?.expenses?.length})`
                  : ""}
              </Tab>
            ) : null}
          </Tab.List>
        </div>

        <Tab.Panels>
          <Tab.Panel>
            <Bucket bucket={bucket} currentUser={currentUser} />
          </Tab.Panel>
          <Tab.Panel>
            <Comments
              bucket={bucket}
              router={router}
              currentUser={currentUser}
            />
          </Tab.Panel>
          <Tab.Panel>
            <Funders bucket={bucket} currentUser={currentUser} />
          </Tab.Panel>
          <Tab.Panel>
            <Expenses
              bucket={bucket}
              round={bucket.round}
              currentUser={currentUser}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </>
  );
};

// Use ISR (Incremental Static Regeneration) for dream detail pages
// This caches pages at the edge and regenerates them every 60 seconds
export async function getStaticProps(ctx) {
  const bucket = await prisma.bucket.findUnique({
    where: { id: ctx.params.bucket },
    include: {
      Images: {
        take: 1,
      },
    },
  });

  // Return 404 for non-existent buckets, retry after 60 seconds
  if (!bucket) {
    return {
      notFound: true,
      revalidate: 60,
    };
  }

  const images = bucket.Images || [];
  return {
    props: {
      head: {
        title: bucket.title,
        description: bucket.description || bucket.summary,
        image: images.length > 0 ? images[0].large : process.env.PLATFORM_LOGO,
      },
    },
    // Regenerate the page every 60 seconds when requested
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  // Don't pre-generate any paths at build time
  // Pages are generated on-demand and cached
  return {
    paths: [],
    fallback: "blocking", // Wait for generation on first request
  };
}

export default BucketIndex;
