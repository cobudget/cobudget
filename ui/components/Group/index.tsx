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
import { FormattedMessage, useIntl } from "react-intl";
import dayjs from "dayjs";
import advancedDayjsFormatting from "dayjs/plugin/advancedFormat";

dayjs.extend(advancedDayjsFormatting);

export const GROUP_PAGE_QUERY = gql`
  query GroupPage($groupSlug: String!) {
    rounds(groupSlug: $groupSlug) {
      id
      slug
      title
      archived
      color
      group {
        id
        slug
      }
      bucketStatusCount {
        OPEN_FOR_FUNDING
      }
      updatedAt
    }
    group(groupSlug: $groupSlug) {
      id
      name
      slug
      info
      finishedTodos
      registrationPolicy
      visibility
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

const GroupIndex = ({ currentUser }) => {
  const router = useRouter();
  const intl = useIntl();
  useEffect(() => {
    if (router.query.group == "c") router.replace("/");
  }, [router]);

  const [
    { data: { rounds, group } = { rounds: [], group: null }, error, fetching },
  ] = useQuery({
    query: GROUP_PAGE_QUERY,
    variables: { groupSlug: router.query.group ?? "c" },
  });

  const [activeRounds, archivedRounds] = useMemo(() => {
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
      <SubMenu currentUser={currentUser} />
      <PageHero>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="col-span-2">
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
          <div>
            {currentUser?.currentGroupMember?.isAdmin && (
              <Link href={`/${group.slug}/new-round`}>
                <Button size="large" color="anthracit" className="float-right">
                  <FormattedMessage defaultMessage="New round" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </PageHero>
      <div
        className={`-mt-12 page flex-1 grid gap-10 grid-cols-1 ${
          showTodos ? "md:grid-cols-5" : ""
        }`}
      >
        <div
          className={`grid gap-4 content-start ${
            showTodos
              ? "grid-cols-1 md:grid-cols-2 col-span-3"
              : "grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4"
          }`}
        >
          {rounds.map((round) => (
            <Link
              href={`/${round.group?.slug ?? "c"}/${round.slug}`}
              key={round.slug}
              passHref
            >
              <LinkCard color={round.color}>
                {round.title}
                {round.archived && (
                  <Label className="right-0 m-2">
                    <FormattedMessage defaultMessage="Archived" />
                  </Label>
                )}
              </LinkCard>
            </Link>
          ))}
        </div>
        {showTodos && (
          <div className="col-span-2">
            <TodoList currentGroup={group} />
          </div>
        )}
      </div>

      <div className="page">
        {activeRounds.map((round, index) => (
          <div
            className={`p-8 border-2 border-gray-400 grid grid-cols-2 ${
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
            </div>
            <div className="flex flex-col content-end justify-end">
              <span className="self-end font-medium text-gray-800">{round.bucketStatusCount.OPEN_FOR_FUNDING} { round.bucketStatusCount.OPEN_FOR_FUNDING === 1 ? process.env.BUCKET_NAME_SINGULAR : process.env.BUCKET_NAME_PLURAL }</span>
              <span className="self-end text-sm text-gray-700">Last Updated {dayjs(round.updatedAt).format("MMM Do, YYYY")}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default GroupIndex;
