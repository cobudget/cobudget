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
  const { fetching, fetchMore, data } = usePaginatedQuery({
    query: STARRED_BUCKETS,
    limit: 12,
    toFullPage: (pagesMap) => {
      const data = Object.values(pagesMap);
      console.log(">>>", data);
    },
    variables: {},
  });

  if (fetching) return <>...</>;

  return <>Fav</>;
}

export default StarredBuckets;
