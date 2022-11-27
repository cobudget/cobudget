import prisma from "../../../prisma";
import dayjs from "dayjs";
import SeededShuffle from "seededshuffle";
import { combineResolvers } from "graphql-resolvers";
import { isGroupAdmin } from "../auth";
import { sign } from "server/utils/jwt";
import { appLink } from "utils/internalLinks";
import subscribers from "../../../subscribers/discourse.subscriber";
import { statusTypeToQuery } from "../helpers";
import discourse from "../../../lib/discourse";

const { groupHasDiscourse, generateComment } = subscribers;

export const bucket = async (parent, { id }) => {
  if (!id) return null;
  const bucket = await prisma.bucket.findUnique({ where: { id } });
  if (!bucket || bucket.deleted) return null;
  return bucket;
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
  const currentMember = await prisma.roundMember.findFirst({
    where: {
      userId: user?.id ?? "undefined",
      round: { slug: roundSlug, group: { slug: groupSlug ?? "c" } },
    },
  });

  const isAdminOrGuide =
    currentMember && (currentMember.isAdmin || currentMember.isModerator);

  const statusFilter = status.map(statusTypeToQuery).filter((s) => s);
  // If canceled in not there in the status filter, explicitly qunselect canceled buckets
  const showCanceled = status.indexOf("CANCELED") === -1;
  const buckets = await prisma.bucket.findMany({
    where: {
      round: { slug: roundSlug, group: { slug: groupSlug ?? "c" } },
      deleted: { not: true },
      OR: statusFilter,
      ...(showCanceled && { canceledAt: null }),
      ...(textSearchTerm && { title: { search: textSearchTerm } }),
      ...(tagValue && {
        tags: { some: { value: tagValue } },
      }),
      ...(!isAdminOrGuide &&
        (currentMember
          ? {
              OR: [
                { publishedAt: { not: null } },
                { cocreators: { some: { id: currentMember.id } } },
              ],
            }
          : { publishedAt: { not: null } })),
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
