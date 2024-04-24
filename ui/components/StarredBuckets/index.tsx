import BucketCard from "components/BucketCard";
import LoadMore from "components/LoadMore";
import PageHero from "components/PageHero";
import { SelectField } from "components/SelectInput";
import Link from "next/link";
import { CURRENT_USER_QUERY } from "pages/_app";
import { useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { gql, useQuery } from "urql";
import usePaginatedQuery from "utils/usePaginatedQuery";

const STARRED_BUCKETS = gql`
  query StarredBuckets($limit: Int, $offset: Int, $roundId: ID) {
    starredBuckets(take: $limit, skip: $offset, roundId: $roundId) {
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
          currency
          color
          slug
          title
          group {
            slug
            name
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
  const [variables, setVariables] = useState<{ roundId?: string }>({});
  const [{ data: currentUserResponse }] = useQuery({
    query: CURRENT_USER_QUERY,
  });
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

  const currentUser = currentUserResponse?.currentUser;
  const { roundOptions, groupOptions } = useMemo(() => {
    if (currentUser) {
      const groups = { Rounds: [{ title: "All" }] };
      currentUser.roundMemberships?.forEach((member) => {
        if (member.round.group) {
          if (groups[member.round.group.name]) {
            groups[member.round.group.name].push(member.round);
          } else {
            groups[member.round.group.name] = [member.round];
          }
        } else {
          groups["Rounds"].push(member.round);
        }
      });
      return {
        roundOptions: groups,
        groupOptions: Object.keys(groups),
      };
    } else
      return {
        roundOptions: [],
        groupOptions: [],
      };
  }, [currentUser]);

  return (
    <PageHero>
      <div className="flex my-6 justify-between items-center">
        <h1 className="text-2xl">★ Starred Buckets</h1>
        <span>
          <p className="font-semibold my-1">Round</p>
          <SelectField
            className="bg-white sm:order-last"
            inputProps={{
              value: variables.roundId,
              onChange: (e) => {
                if (e.target.value === "All") {
                  delete variables.roundId;
                  setVariables({ ...variables });
                } else {
                  setVariables({ roundId: e.target.value });
                }
              },
            }}
          >
            {groupOptions.map((option) => (
              <optgroup label={option} key={option}>
                {roundOptions[option].map((option) => (
                  <option value={option.id} key={option.id}>
                    {option.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </SelectField>
        </span>
      </div>
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {data.buckets.length === 0 && !fetching && (
            <div className="flex justify-center items-center w-full col-span-3 my-6 font-bold text-gray-400">
              <span>
                <FormattedMessage defaultMessage="No bucket found" />
              </span>
            </div>
          )}
          {data.buckets.map((bucket) => (
            <Link
              href={`/${bucket.round.group?.slug || "c"}/${bucket.round.slug}/${
                bucket.id
              }`}
              key={bucket.id}
            >
              <a>
                <BucketCard bucket={bucket} round={bucket.round} showRound />
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
