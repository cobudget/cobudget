import { useEffect, useMemo, useState, useCallback } from "react";
import { useQuery, useMutation, gql } from "urql";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import TodoList from "../TodoList";
import SubMenu from "../SubMenu";
import PageHero from "../PageHero";
import EditableField from "../EditableField";
import { FormattedMessage, useIntl } from "react-intl";
import dayjs from "dayjs";
import advancedDayjsFormatting from "dayjs/plugin/advancedFormat";
import ImportRound from "./ImportRound";
import RoundCard, { SortableRoundCard } from "./RoundCard";

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
      position
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
      previewImages {
        id
        small
        large
        bucketId
      }
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

const SET_ROUND_POSITION_MUTATION = gql`
  mutation SetRoundPosition($roundId: ID!, $newPosition: Float!) {
    setRoundPosition(roundId: $roundId, newPosition: $newPosition) {
      id
      position
    }
  }
`;

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
      fetching,
    },
  ] = useQuery({
    query: GROUP_PAGE_QUERY,
    variables: { groupSlug: router.query.group ?? "c" },
  });

  const [, setRoundPosition] = useMutation(SET_ROUND_POSITION_MUTATION);

  // Drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      return [[], []];
    }

    // Sort by position (nulls last), then by createdAt desc
    const sortByPosition = (a, b) => {
      if (a.position == null && b.position == null) return 0;
      if (a.position == null) return 1;
      if (b.position == null) return -1;
      return a.position - b.position;
    };

    return [
      rounds.filter((r) => !r.archived).sort(sortByPosition),
      rounds.filter((r) => r.archived).sort(sortByPosition),
    ];
  }, [rounds]);

  // Handle drag end for reordering
  const handleDragEnd = useCallback(
    (event, roundsList) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = roundsList.findIndex((r) => r.id === active.id);
      const newIndex = roundsList.findIndex((r) => r.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      // Calculate new position using fractional positioning
      let beforePosition;
      let afterPosition;
      let beforeItem;
      const afterItem = roundsList[newIndex];

      if (oldIndex > newIndex) {
        beforeItem = roundsList[newIndex - 1];
      } else {
        beforeItem = roundsList[newIndex + 1];
      }

      if (beforeItem) {
        beforePosition = beforeItem.position ?? roundsList.length;
      } else {
        // Last element
        beforePosition = (roundsList[roundsList.length - 1].position ?? roundsList.length - 1) + 1;
      }

      if (newIndex === 0) {
        // First element
        afterPosition = (roundsList[0].position ?? 0) - 1;
        beforePosition = roundsList[0].position ?? 0;
      } else {
        afterPosition = afterItem.position ?? newIndex;
      }

      const newPosition = (beforePosition - afterPosition) / 2.0 + afterPosition;

      setRoundPosition({
        roundId: active.id,
        newPosition,
      });
    },
    [setRoundPosition]
  );

  const isAdmin = currentUser?.currentGroupMember?.isAdmin;

  // Check router.isReady before using router.query to prevent hydration mismatch
  if (!fetching && !group && router.isReady && router.query.group) {
    return (
      <div className="text-center mt-7">
        <FormattedMessage defaultMessage="This group either doesn't exist or you don't have access to it" />
      </div>
    );
  }

  if (!group || fetching) return null;

  const showTodos = isAdmin && !group.finishedTodos;
  return (
    <>
      <PageHero>
        {/* Mobile: Centered layout / Desktop: Side-by-side */}
        <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left md:gap-8">
          {/* Logo */}
          <div className="flex-shrink-0 mb-5 md:mb-0">
            <img
              src={group.logo}
              alt={`${group.slug}_logo`}
              className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-2xl shadow-lg ring-4 ring-white"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {group.name}
            </h1>
            <div className="text-gray-600">
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

          {/* Start new round button */}
          {currentUser?.currentGroupMember?.isAdmin && (
            <div className="mt-5 md:mt-0 flex-shrink-0">
              {group?.subscriptionStatus?.isActive ? (
                <Link
                  href={`/${group.slug}/new-round`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <FormattedMessage defaultMessage="Start new round" />
                </Link>
              ) : (
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  onClick={() => {
                    const event = new CustomEvent("show-upgrade-group-message", {
                      detail: { groupId: group?.id },
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <FormattedMessage defaultMessage="Start new round" />
                </button>
              )}
            </div>
          )}
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
        {/* Active Rounds Section */}
        <div>
          {(!rounds || rounds.length === 0) && currentUser?.currentGroupMember?.isAdmin && (
            <ImportRound group={group} />
          )}

          {activeRounds.length > 0 && (
            isAdmin ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEnd(event, activeRounds)}
              >
                <SortableContext
                  items={activeRounds.map((r) => r.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeRounds.map((round) => (
                      <SortableRoundCard
                        key={round.id}
                        id={round.id}
                        round={round}
                        balance={balancesMap[round.id]}
                        bucketCountHeading={`${round.publishedBucketCount} ${
                          round.publishedBucketCount === 1
                            ? process.env.BUCKET_NAME_SINGULAR
                            : process.env.BUCKET_NAME_PLURAL
                        }`}
                        showDistributedAmount={false}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRounds.map((round) => (
                  <RoundCard
                    key={round.id}
                    round={round}
                    balance={balancesMap[round.id]}
                    bucketCountHeading={`${round.publishedBucketCount} ${
                      round.publishedBucketCount === 1
                        ? process.env.BUCKET_NAME_SINGULAR
                        : process.env.BUCKET_NAME_PLURAL
                    }`}
                    showDistributedAmount={false}
                  />
                ))}
              </div>
            )
          )}
        </div>

        {/* Archived Rounds Section */}
        {archivedRounds.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              <FormattedMessage defaultMessage="Archived Rounds" />
            </h2>
            {isAdmin ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEnd(event, archivedRounds)}
              >
                <SortableContext
                  items={archivedRounds.map((r) => r.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {archivedRounds.map((round) => (
                      <SortableRoundCard
                        key={round.id}
                        id={round.id}
                        round={round}
                        balance={balancesMap[round.id]}
                        bucketCountHeading={`${round.bucketStatusCount.FUNDED} ${intl.formatMessage({
                          defaultMessage: "funded",
                        })} ${
                          round.bucketStatusCount.FUNDED === 1
                            ? process.env.BUCKET_NAME_SINGULAR
                            : process.env.BUCKET_NAME_PLURAL
                        }`}
                        showDistributedAmount
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {archivedRounds.map((round) => (
                  <RoundCard
                    key={round.id}
                    round={round}
                    balance={balancesMap[round.id]}
                    bucketCountHeading={`${round.bucketStatusCount.FUNDED} ${intl.formatMessage({
                      defaultMessage: "funded",
                    })} ${
                      round.bucketStatusCount.FUNDED === 1
                        ? process.env.BUCKET_NAME_SINGULAR
                        : process.env.BUCKET_NAME_PLURAL
                    }`}
                    showDistributedAmount
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default GroupIndex;
