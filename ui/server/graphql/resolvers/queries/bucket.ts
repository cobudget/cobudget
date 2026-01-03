import dayjs from "dayjs";
import SeededShuffle from "seededshuffle";
import discourse from "../../../lib/discourse";
import prisma from "../../../prisma";
import subscribers from "../../../subscribers/discourse.subscriber";
import { canViewRound, statusTypeToQuery } from "../helpers";
import { getStarredBuckets } from "../helpers/bucket";

const { groupHasDiscourse, generateComment } = subscribers;

// Simple in-memory cache for bucketsPage to avoid re-fetching/re-shuffling
// Cache entries expire after 5 minutes (increased from 30s for better performance)
const CACHE_TTL_MS = 5 * 60 * 1000;
const bucketsCache = new Map<
  string,
  { data: any[]; timestamp: number }
>();

function getCacheKey(params: {
  roundSlug: string;
  groupSlug: string;
  status: string[];
  textSearchTerm?: string;
  tagValue?: string;
  orderBy?: string;
  orderDir?: string;
  userId?: string;
  dateSeed: string;
}): string {
  return JSON.stringify({
    roundSlug: params.roundSlug,
    groupSlug: params.groupSlug,
    status: params.status?.sort(),
    textSearchTerm: params.textSearchTerm || "",
    tagValue: params.tagValue || "",
    orderBy: params.orderBy || "",
    orderDir: params.orderDir || "",
    userId: params.userId || "",
    dateSeed: params.dateSeed,
  });
}

function getFromCache(key: string): any[] | null {
  const entry = bucketsCache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    bucketsCache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache(key: string, data: any[]): void {
  // Clean up old entries periodically (keep cache from growing unbounded)
  if (bucketsCache.size > 100) {
    const now = Date.now();
    for (const [k, v] of bucketsCache.entries()) {
      if (now - v.timestamp > CACHE_TTL_MS) {
        bucketsCache.delete(k);
      }
    }
  }

  bucketsCache.set(key, { data, timestamp: Date.now() });
}

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
    status = [],
    orderBy,
    orderDir,
  },
  { user }
) => {
  // Parallelize initial queries for better performance
  const [round, currentMember] = await Promise.all([
    prisma.round.findFirst({
      where: {
        slug: roundSlug,
        group: { slug: groupSlug ?? "c" },
        deleted: { not: true },
      },
      // Include fields needed for funding status calculation
      select: {
        id: true,
        grantingOpens: true,
        grantingCloses: true,
      },
    }),
    // Only query for currentMember if user is logged in
    user?.id
      ? prisma.roundMember.findFirst({
          where: {
            userId: user.id,
            round: { slug: roundSlug, group: { slug: groupSlug ?? "c" } },
          },
        })
      : Promise.resolve(null),
  ]);

  if (!round) {
    return { moreExist: false, buckets: [] };
  }

  // Compute funding status inline (avoids extra DB query)
  const fundingStatus = {
    hasStarted: round.grantingOpens
      ? round.grantingOpens.getTime() < Date.now()
      : true,
    hasEnded: round.grantingCloses
      ? round.grantingCloses.getTime() < Date.now()
      : false,
  };

  const isAdminOrGuide =
    currentMember && (currentMember.isAdmin || currentMember.isModerator);

  const todaySeed = dayjs().format("YYYY-MM-DD");

  // Generate cache key for this query (excluding offset/limit since we cache the full list)
  const cacheKey = getCacheKey({
    roundSlug,
    groupSlug: groupSlug ?? "c",
    status,
    textSearchTerm,
    tagValue,
    orderBy,
    orderDir,
    // Include factors that affect the result set
    userId: user?.id,
    dateSeed: todaySeed,
  });

  // Check cache first
  let shuffledBuckets = getFromCache(cacheKey);

  if (!shuffledBuckets) {
    // Cache miss - fetch and process
    const statusFilter = status
      .map((s) => statusTypeToQuery(s, fundingStatus))
      .filter((s) => s !== false) as Record<string, unknown>[];
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
        ...(statusFilter.length > 0 && { OR: statusFilter }),
        ...(showCanceled && { canceledAt: null }),
        ...(textSearchTerm && {
          title: { contains: textSearchTerm, mode: "insensitive" },
        }),
        ...(tagValue && {
          tags: { some: { value: tagValue } },
        }),
      },
      // Include relations to avoid N+1 queries in field resolvers
      include: {
        Images: true,
        flags: true,
        round: {
          select: {
            id: true,
            canCocreatorStartFunding: true,
            grantingOpens: true,
            grantingCloses: true,
          },
        },
        FieldValues: {
          include: { field: true },
        },
        BudgetItems: true,
      },
      ...(orderBy && { orderBy: { [orderBy]: orderDir } }),
    });

    // Early return if no buckets found
    if (buckets.length === 0) {
      setCache(cacheKey, []);
      return { moreExist: false, buckets: [] };
    }

    // Batch fetch aggregates for all buckets to avoid N+1 queries
    const bucketIds = buckets.map((b) => b.id);

    const [contributionSums, commentCounts, funderGroups, currentMemberContribs] =
      await Promise.all([
        // Total contributions per bucket
        prisma.contribution.groupBy({
          by: ["bucketId"],
          where: { bucketId: { in: bucketIds } },
          _sum: { amount: true },
        }),
        // Comment counts per bucket
        prisma.comment.groupBy({
          by: ["bucketId"],
          where: { bucketId: { in: bucketIds } },
          _count: true,
        }),
        // Funders per bucket (distinct roundMemberIds)
        prisma.contribution.groupBy({
          by: ["bucketId", "roundMemberId"],
          where: { bucketId: { in: bucketIds } },
        }),
        // Current member's contributions (if logged in)
        currentMember
          ? prisma.contribution.groupBy({
              by: ["bucketId"],
              where: {
                bucketId: { in: bucketIds },
                roundMemberId: currentMember.id,
              },
              _sum: { amount: true },
            })
          : Promise.resolve([]),
      ]);

    // Create lookup maps for O(1) access
    const contributionMap = new Map(
      contributionSums.map((c) => [c.bucketId, c._sum.amount || 0])
    );
    const commentCountMap = new Map(
      commentCounts.map((c) => [c.bucketId, c._count])
    );
    const funderCountMap = new Map<string, number>();
    funderGroups.forEach((f) => {
      funderCountMap.set(f.bucketId, (funderCountMap.get(f.bucketId) || 0) + 1);
    });
    const currentMemberContribMap = new Map(
      currentMemberContribs.map((c) => [c.bucketId, c._sum.amount || 0])
    );

    // Enrich buckets with pre-computed values
    const enrichedBuckets = buckets.map((bucket) => ({
      ...bucket,
      // Map relation names to match GraphQL schema
      images: bucket.Images,
      customFields: bucket.FieldValues,
      // Pre-computed aggregates and values
      _computed: {
        totalContributions: contributionMap.get(bucket.id) || 0,
        noOfComments: commentCountMap.get(bucket.id) || 0,
        noOfFunders: funderCountMap.get(bucket.id) || 0,
        totalContributionsFromCurrentMember:
          currentMemberContribMap.get(bucket.id) || 0,
        // Compute goals from included BudgetItems
        minGoal: bucket.BudgetItems.reduce(
          (acc, item) => acc + (item.type === "EXPENSE" ? item.min : 0),
          0
        ),
        maxGoal: bucket.BudgetItems.reduce(
          (acc, item) =>
            acc + (item.type === "EXPENSE" ? item.max ?? item.min : 0),
          0
        ),
        income: bucket.BudgetItems.reduce(
          (acc, item) => acc + (item.type === "INCOME" ? item.min : 0),
          0
        ),
        // Round funding status (already fetched at start)
        roundFundingStatus: fundingStatus,
      },
    }));

    shuffledBuckets = enrichedBuckets;
    if (!orderBy) {
      SeededShuffle.shuffle(
        enrichedBuckets,
        user ? user.id + todaySeed : todaySeed
      );
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

    // Cache the enriched and shuffled result for subsequent page requests
    setCache(cacheKey, shuffledBuckets);
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

// Simple in-memory cache for commentSet to avoid re-fetching
// Cache entries expire after 2 minutes
const COMMENT_CACHE_TTL_MS = 2 * 60 * 1000;
const commentsCache = new Map<
  string,
  { data: { total: number; comments: any[] }; timestamp: number }
>();

function getCommentCacheKey(bucketId: string): string {
  return `comments:${bucketId}`;
}

function getCommentsFromCache(
  key: string
): { total: number; comments: any[] } | null {
  const entry = commentsCache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > COMMENT_CACHE_TTL_MS) {
    commentsCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCommentsCache(
  key: string,
  data: { total: number; comments: any[] }
): void {
  commentsCache.set(key, { data, timestamp: Date.now() });

  // Cleanup old entries periodically (every 100 sets)
  if (commentsCache.size > 100 && Math.random() < 0.1) {
    const now = Date.now();
    for (const [k, v] of commentsCache.entries()) {
      if (now - v.timestamp > COMMENT_CACHE_TTL_MS) {
        commentsCache.delete(k);
      }
    }
  }
}

export const commentSet = async (
  parent,
  { bucketId, from = 0, limit = 30, order = "desc" }
) => {
  // Check cache first (cache the full comment list, then slice for pagination)
  const cacheKey = getCommentCacheKey(bucketId);
  let allComments = getCommentsFromCache(cacheKey);

  if (!allComments) {
    // First, check if this bucket uses Discourse
    const bucket = await prisma.bucket.findUnique({
      where: { id: bucketId },
      select: {
        id: true,
        roundId: true,
        discourseTopicId: true,
        round: {
          select: {
            group: {
              select: {
                id: true,
                discourse: true,
              },
            },
          },
        },
      },
    });

    if (!bucket) {
      return { total: 0, comments: [] };
    }

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
      // Fetch comments with roundMember and user included to avoid N+1 queries
      comments = await prisma.comment.findMany({
        where: { bucketId: bucketId },
        orderBy: { createdAt: "desc" },
        include: {
          collMember: {
            include: {
              user: true,
            },
          },
        },
      });
    }

    allComments = { total: comments.length, comments };
    setCommentsCache(cacheKey, allComments);
  }

  // Apply pagination
  let shown = allComments.comments.slice(0, from + limit);

  if (order === "desc") {
    shown = shown.reverse();
  }

  return {
    total: allComments.total,
    comments: shown,
  };
};

export const expense = async (_, { id }) => {
  return prisma.expense.findUnique({ where: { id } });
};
