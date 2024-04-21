import BucketCard from "components/BucketCard";
import LoadMore from "components/LoadMore";
import PageHero from "components/PageHero";
import Link from "next/link";
import { useState } from "react";
import { gql, useQuery } from "urql";
import usePaginatedQuery from "utils/usePaginatedQuery";

const STARRED_BUCKETS = gql`
  query StarredBuckets($limit: Int, $offset: Int) {
    starredBuckets(take: $limit, skip: $offset) {
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
        round {
          canCocreatorStartFunding
          id
          slug
          group {
            slug
          }
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

function StarredBuckets() {
  const [variables] = useState({});
  const { fetching, fetchMore, data } = usePaginatedQuery({
    query: STARRED_BUCKETS,
    limit: 18,
    toFullPage: (pagesMap) => {
      const pages: any = Object.values(pagesMap);
      return pages.reduce(
        (acc, page) => {
          return {
            moreExist: page.starredBuckets.moreExist && acc.moreExist,
            buckets: [...acc.buckets, ...page.starredBuckets.buckets],
          };
        },
        {
          buckets: [],
          moreExist: true,
        }
      );
    },
    variables,
  });

  return (
    <PageHero>
      <h1 className="text-center my-6 text-2xl">★ Starred Buckets</h1>
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {data.buckets.map((bucket) => (
            <Link
              href={`/${bucket.round.group?.slug || "c"}/${bucket.round.slug}/${
                bucket.id
              }`}
              key={bucket.id}
            >
              <a>
                <BucketCard bucket={bucket} round={bucket.round} />
              </a>
            </Link>
          ))}
        </div>
        <div className="flex justify-center items-center">
          {data.moreExist && (
            <LoadMore
              moreExist={data.moreExist}
              onClick={fetchMore}
              loading={fetching}
            />
          )}
        </div>
      </div>
    </PageHero>
  );
}

export default StarredBuckets;
