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
    limit: 12,
    toFullPage: (pagesMap) => {
      const pages: any = Object.values(pagesMap);
      return pages.reduce(
        (acc, page) => {
          return {
            moreExist: page.starredBuckets.moreExist,
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
    <>
        <h1 className="text-center my-6 text-2xl">★ Starred Buckets</h1>
    </>
  )
}

export default StarredBuckets;
