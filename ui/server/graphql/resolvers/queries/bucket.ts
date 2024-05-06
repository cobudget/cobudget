import prisma from "../../../prisma";
import dayjs from "dayjs";
import SeededShuffle from "seededshuffle";
import { combineResolvers } from "graphql-resolvers";
import { isGroupAdmin } from "../auth";
import { sign } from "server/utils/jwt";
import { appLink } from "utils/internalLinks";
import subscribers from "../../../subscribers/discourse.subscriber";
import {
  canViewRound,
  getRoundFundingStatuses,
  statusTypeToQuery,
} from "../helpers";
import discourse from "../../../lib/discourse";
import { ROUND_IS_PRIVATE } from "../../../../constants";
import { getStarredBuckets } from "../helpers/bucket";

const { groupHasDiscourse, generateComment } = subscribers;

export const bucket = async (parent, { id }, { user, ss }) => {
  if (!id) return null;
  const bucket = await prisma.bucket.findUnique({ where: { id } });
  if (!bucket || bucket.deleted) return null;

  const round = await prisma.round.findUnique({
    where: { id: bucket.roundId },
  });
  if ((await canViewRound({ user, round })) || ss) {
    return bucket;
  }

  return null;
};

export const bucketsPage = async (
  parent,
  {
    roundSlug,
    groupSlug,
    textSearchTerm,
    tag: tagValue,
    offset = 0,
    limit,
    status,
    orderBy,
    orderDir,
  },
  { user }
) => {
  const round = await prisma.round.findFirst({
    where: {
      slug: roundSlug,
      group: { slug: groupSlug ?? "c" },
      deleted: { not: true },
    },
  });
  const fundingStatus = await getRoundFundingStatuses({ roundId: round.id });
  const currentMember = await prisma.roundMember.findFirst({
    where: {
      userId: user?.id ?? "undefined",
      round: { slug: roundSlug, group: { slug: groupSlug ?? "c" } },
    },
  });

  const isAdminOrGuide =
    currentMember && (currentMember.isAdmin || currentMember.isModerator);

  const statusFilter = status
    .map((s) => statusTypeToQuery(s, fundingStatus))
    .filter((s) => s);
  // If canceled in not there in the status filter, explicitly unselect canceled buckets
  const showCanceled = status.indexOf("CANCELED") === -1;
  const showDraft = status.indexOf("PENDING_APPROVAL") !== -1;

  // If a user is not an admin or moderator, then dont return all draft buckets
  // Instead return the draft buckets which are created by the current user
  if (showDraft && !isAdminOrGuide) {
    statusFilter.forEach((filter) => {
      if (filter.publishedAt === null) {
        filter.publishedAt = { not: null };
      }
    });
    if (currentMember) {
      statusFilter.push({ cocreators: { some: { id: currentMember?.id } } });
    }
  }

  const buckets = await prisma.bucket.findMany({
    where: {
      round: { slug: roundSlug, group: { slug: groupSlug ?? "c" } },
      deleted: { not: true },
      OR: statusFilter,
      ...(showCanceled && { canceledAt: null }),
      ...(textSearchTerm && {
        title: { contains: textSearchTerm, mode: "insensitive" },
      }),
      ...(tagValue && {
        tags: { some: { value: tagValue } },
      }),
    },
    ...(orderBy && { orderBy: { [orderBy]: orderDir } }),
  });

  const todaySeed = dayjs().format("YYYY-MM-DD");

  let shuffledBuckets = buckets;
  if (!orderBy) {
    SeededShuffle.shuffle(buckets, user ? user.id + todaySeed : todaySeed);
  } else if (
    orderBy === "percentageFunded" ||
    orderBy === "contributionsCount"
  ) {
    // Move nulls to last manually. This feature is added to prisma but not pushed to release yet
    // https://github.com/prisma/prisma-engines/pull/3036

    const index = shuffledBuckets.findIndex((b) => b[orderBy] !== null);
    const length = shuffledBuckets.length;

    shuffledBuckets = shuffledBuckets
      .splice(index, length - index)
      .concat(shuffledBuckets);
  }

  return {
    moreExist: shuffledBuckets.length > limit + offset,
    buckets: shuffledBuckets.slice(offset, limit + offset),
  };
};

export const starredBuckets = async (_, { take, skip, roundId }, { user }) => {
  if (user) {
    const favorites = await getStarredBuckets({
      userId: user?.id,
      take,
      skip,
      roundId,
    });
    const buckets = await prisma.bucket.findMany({
      where: {
        id: { in: favorites.map((favorite) => favorite.bucketId) },
      },
    });
    const moreExist = favorites.length === take;
    return {
      buckets,
      moreExist,
    };
  } else {
    return {
      moreExist: false,
      buckets: [],
    };
  }
};

export const commentSet = async (
  parent,
  { bucketId, from = 0, limit = 30, order = "desc" }
) => {
  const bucket = await prisma.bucket.findUnique({
    where: { id: bucketId },
    include: {
      comments: true,
      round: {
        include: { group: { include: { discourse: true } } },
      },
    },
  });
  // const bucket = await Bucket.findOne({ _id: bucketId });

  let comments;
  const group = bucket.round.group;

  if (groupHasDiscourse(group)) {
    const topic = await discourse(group.discourse).posts.get(
      bucket.discourseTopicId
    );

    comments = await Promise.all(
      topic.post_stream.posts
        .filter((post) => post.post_number > 1)
        .filter((post) => !post.user_deleted)
        // filter out empty system comments, e.g. when a thread is moved
        .filter(
          (comment) => !(comment.username === "system" && comment.raw === "")
        )
        .reverse()
        .map(async (post) => {
          const author = await prisma.roundMember.findFirst({
            where: {
              roundId: bucket.roundId,
              user: {
                groupMemberships: {
                  some: {
                    discourseUsername: post.username,
                    groupId: group.id,
                  },
                },
              },
            },
          });

          return generateComment(post, author);
        })
    );
  } else {
    comments = await prisma.comment.findMany({
      where: { bucketId: bucketId },
      orderBy: { createdAt: "desc" },
    });
  }

  let shown = comments.slice(0, from + limit);

  if (order === "desc") {
    shown = shown.reverse();
  }

  return {
    total: comments.length,
    comments: shown,
  };
};

export const expense = async (_, { id }) => {
  return prisma.expense.findUnique({ where: { id } });
};
