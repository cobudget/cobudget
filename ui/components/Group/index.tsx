import { forwardRef, useEffect, useMemo } from "react";
import { useQuery, gql } from "urql";
import Link from "next/link";
import { useRouter } from "next/router";

import Button from "../Button";
import TodoList from "../TodoList";
import Label from "../Label";
import SubMenu from "../SubMenu";
import PageHero from "../PageHero";
import EditableField from "../EditableField";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";
import dayjs from "dayjs";
import advancedDayjsFormatting from "dayjs/plugin/advancedFormat";
import FormattedCurrency from "components/FormattedCurrency";
import ImportRound from "./ImportRound";

dayjs.extend(advancedDayjsFormatting);

export const GROUP_PAGE_QUERY = gql`
  query GroupPage($groupSlug: String!) {
    rounds(groupSlug: $groupSlug) {
      id
      slug
      title
      archived
      color
      currency
      group {
        id
        slug
      }
      publishedBucketCount
      bucketStatusCount {
        FUNDED
      }
      updatedAt
      distributedAmount
      publishedBucketCount
    }
    group(groupSlug: $groupSlug) {
      id
      name
      slug
      info
      finishedTodos
      registrationPolicy
      visibility
      logo
      subscriptionStatus {
        isActive
      }
    }
    balances(groupSlug: $groupSlug) {
      roundId
      balance
    }
  }
`;

const LinkCard = forwardRef((props: any, ref) => {
  const { color, className, children } = props;
  return (
    <a
      {...props}
      className={
        `bg-${color} ` +
        `ring-${color}-dark hover:ring ` +
        "cursor-pointer group p-4 font-medium rounded-md text-white flex justify-between items-start transitions-shadows duration-75" +
        " " +
        (className ? className : "h-32")
      }
      ref={ref}
    >
      {children}
    </a>
  );
});

function RoundRow({
  round,
  index,
  balance,
  showDistributedAmount,
  bucketCountHeading,
}) {
  return (
    <div
      className={`p-8 border-2 border-gray-400 sm:grid grid-cols-2 ${
        index === 0 ? "" : " border-t-0"
      }`}
      key={round.id}
    >
      <div className="flex content-center">
        <span className="underline-offset-4 underline font-medium text-blue-700">
          <Link
            href={`/${round.group?.slug ?? "c"}/${round.slug}`}
            key={round.slug}
            passHref
          >
            {round.title}
          </Link>
        </span>
        {balance ? (
          <span>
            <span className="ml-2 text-gray-800 bg-highlight">
              <FormattedCurrency value={balance} currency={round.currency} />
            </span>
          </span>
        ) : null}
      </div>
      <div className="flex flex-col content-end justify-end">
        <span className="mt-1 sm:mt-0 sm:self-end font-medium text-gray-800">
          {showDistributedAmount && (
            <>
              <FormattedCurrency
                currency={round.currency}
                value={round.distributedAmount}
              />{" "}
              <FormattedMessage defaultMessage="distributed" /> •{" "}
            </>
          )}
          {bucketCountHeading}
        </span>
        <span className="sm:self-end text-sm text-gray-700">
          <FormattedMessage defaultMessage="Last Updated" />{" "}
          <FormattedDate
            value={round.updatedAt}
            day="numeric"
            month="short"
            year="numeric"
          />
        </span>
      </div>
    </div>
  );
}

const GroupIndex = ({ currentUser }) => {
  const router = useRouter();
  const intl = useIntl();
  useEffect(() => {
    if (router.query.group == "c") router.replace("/");
  }, [router]);

  const [
    {
      data: { rounds, group, balances } = {
        rounds: [],
        group: null,
        balances: [],
      },
      error,
      fetching,
    },
  ] = useQuery({
    query: GROUP_PAGE_QUERY,
    variables: { groupSlug: router.query.group ?? "c" },
  });

  const balancesMap = useMemo(() => {
    const map = {};
    //balances can be null if the group is not found
    if (!balances) {
      return map;
    }
    balances.forEach((b) => {
      map[b.roundId] = b.balance;
    });
    return map;
  }, [balances]);

  const [activeRounds, archivedRounds] = useMemo(() => {
    if (!rounds) {
      return [];
    }

    return [
      rounds.filter((r) => !r.archived),
      rounds.filter((r) => r.archived),
    ];
  }, [rounds]);

  if (!fetching && !group && router.query.group) {
    return (
      <div className="text-center mt-7">
        <FormattedMessage defaultMessage="This group either doesn't exist or you don't have access to it" />
      </div>
    );
  }

  if (!group || fetching) return null;

  const showTodos =
    currentUser?.currentGroupMember?.isAdmin && !group.finishedTodos;
  return (
    <>
      <PageHero>
        <div className="grid grid-cols-1 sm:grid-cols-groupheading gap-6">
          <div className="flex content-center justify-center">
            <img
              src={group.logo}
              alt={`${group.slug}_logo`}
              className="object-cover h-32 w-32"
            />
          </div>
          <div>
            <EditableField
              defaultValue={group?.info}
              name="info"
              label={intl.formatMessage({ defaultMessage: "Add message" })}
              placeholder={intl.formatMessage(
                { defaultMessage: "# Welcome to {groupName}'s page" },
                { groupName: group?.name }
              )}
              canEdit={currentUser?.currentGroupMember?.isAdmin}
              className="h-10"
              MUTATION={gql`
                mutation EditGroupInfo($groupId: ID!, $info: String) {
                  editGroup(groupId: $groupId, info: $info) {
                    id
                    info
                  }
                }
              `}
              variables={{ groupId: group?.id }}
              maxLength={500}
              required
            />
          </div>
        </div>
      </PageHero>
      <SubMenu currentUser={currentUser} />
      <div className={`page ${showTodos ? "md:grid-cols-5" : ""}`}>
        {showTodos && (
          <div>
            <TodoList currentGroup={group} />
          </div>
        )}
      </div>

      <div className="page">
        <div className="my-4">
          <span className="font-medium">
            <FormattedMessage defaultMessage="Active Rounds" />
          </span>
          {currentUser?.currentGroupMember?.isAdmin &&
            (group?.subscriptionStatus?.isActive ? (
              <Link href={`/${group.slug}/new-round`}>
                <span className="text-sm text-blue-600 font-medium ml-2 cursor-pointer">
                  <FormattedMessage defaultMessage="Start new round" />
                </span>
              </Link>
            ) : (
              <span
                className="text-sm text-blue-600 font-medium ml-2 cursor-pointer"
                onClick={() => {
                  const event = new CustomEvent("show-upgrade-group-message", {
                    detail: { groupId: group?.id },
                  });
                  window.dispatchEvent(event);
                  return;
                }}
              >
                <FormattedMessage defaultMessage="Start new round" />
              </span>
            ))}
        </div>
        {rounds.length === 0 && currentUser?.currentGroupMember?.isAdmin && (
          <ImportRound group={group} />
        )}

        {activeRounds.map((round, index) => (
          <RoundRow
            round={round}
            index={index}
            key={index}
            balance={balancesMap[round.id]}
            bucketCountHeading={`${round.publishedBucketCount} 
            ${
              round.publishedBucketCount === 1
                ? process.env.BUCKET_NAME_SINGULAR
                : process.env.BUCKET_NAME_PLURAL
            }`}
            showDistributedAmount={false}
          />
        ))}
        {archivedRounds.length > 0 && (
          <>
            <div className="my-4">
              <span className="font-medium">
                <FormattedMessage defaultMessage="Archived Rounds" />
              </span>
            </div>
            {archivedRounds.map((round, index) => (
              <RoundRow
                round={round}
                index={index}
                key={index}
                balance={balancesMap[round.id]}
                bucketCountHeading={`${
                  round.bucketStatusCount.FUNDED
                } ${intl.formatMessage({ defaultMessage: "funded" })} 
            ${
              round.bucketStatusCount.FUNDED === 1
                ? process.env.BUCKET_NAME_SINGULAR
                : process.env.BUCKET_NAME_PLURAL
            }`}
                showDistributedAmount
              />
            ))}
          </>
        )}
      </div>
    </>
  );
};

export default GroupIndex;
