import prisma from "server/prisma";
import { HIDDEN } from "../../../../constants";
import { getRoundMember } from "../helpers";

// Helper function to determine bucket status based on its fields
const computeBucketStatus = (bucket) => {
  if (bucket.canceledAt) return "CANCELED";
  if (bucket.completedAt) return "COMPLETED";
  if (bucket.fundedAt) return "FUNDED";
  if (bucket.readyForFundingAt) return "OPEN_FOR_FUNDING";
  if (bucket.publishedAt) return "PENDING_APPROVAL";
  return "IDEA";
};

// Helper to convert status filter to Prisma query conditions
const statusTypeToQuery = (status) => {
  switch (status) {
    case "CANCELED":
      return { canceledAt: { not: null } };
    case "COMPLETED":
      return { completedAt: { not: null } };
    case "FUNDED":
      return { fundedAt: { not: null }, canceledAt: null, completedAt: null };
    case "OPEN_FOR_FUNDING":
      return {
        readyForFundingAt: { not: null },
        fundedAt: null,
        canceledAt: null,
        completedAt: null,
      };
    case "PENDING_APPROVAL":
      return {
        publishedAt: { not: null },
        readyForFundingAt: null,
        fundedAt: null,
        canceledAt: null,
        completedAt: null,
      };
    case "IDEA":
      return {
        publishedAt: null,
        readyForFundingAt: null,
        fundedAt: null,
        canceledAt: null,
        completedAt: null,
      };
    default:
      return null;
  }
};

export const budgetItems = async (
  _,
  {
    roundId,
    search,
    bucketId,
    status,
    minBudget,
    stretchBudget,
    offset = 0,
    limit = 10,
    orderBy = "createdAt",
    orderDir = "desc",
  },
  { user }
) => {
  // 1. Check if the round exists.
  const round = await prisma.round.findFirst({ where: { id: roundId } });
  if (!round) {
    return {
      budgetItems: [],
      total: 0,
      moreExist: false,
      error: "Round not found",
    };
  }

  // 2. Enforce visibility rules.
  if (round.visibility === HIDDEN) {
    const roundMember = user
      ? await getRoundMember({ userId: user.id, roundId })
      : null;
    if (!roundMember?.isApproved) {
      return {
        budgetItems: [],
        total: 0,
        moreExist: false,
        error: "You must be an approved member of this round.",
      };
    }
  }

  // 3. Build the filter.
  const where: any = { roundId };

  if (bucketId) {
    where.bucketId = bucketId;
  }
  if (search) {
    where.description = { contains: search, mode: "insensitive" };
  }
  if (status && status.length) {
    // Build OR conditions for each status
    const orConditions = status
      .map((s) => statusTypeToQuery(s))
      .filter(Boolean);

    if (orConditions.length > 0) {
      where.Bucket = { OR: orConditions };
    }
  }
  if (typeof minBudget === "number") {
    where.min = { gte: minBudget };
  }
  if (typeof stretchBudget === "number") {
    where.max = { gte: stretchBudget };
  }

  // 4. Query budget items (including the minimal bucket info needed).
  const mappedOrderBy =
    orderBy === "minBudget"
      ? "min"
      : orderBy === "stretchBudget"
      ? "max"
      : orderBy;

  const [items, total] = await Promise.all([
    prisma.budgetItem.findMany({
      where,
      include: {
        Bucket: {
          select: {
            id: true,
            title: true,
            publishedAt: true,
            readyForFundingAt: true,
            fundedAt: true,
            canceledAt: true,
            completedAt: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        [mappedOrderBy]: orderDir,
      },
    }),
    prisma.budgetItem.count({ where }),
  ]);

  const results = items.map((it) => ({
    id: it.id,
    description: it.description,
    minBudget: it.min,
    stretchBudget: it.max,
    bucket: it.Bucket
      ? {
          id: it.Bucket.id,
          title: it.Bucket.title,
          status: computeBucketStatus(it.Bucket),
        }
      : null,
  }));

  return {
    total,
    moreExist: total > offset + items.length,
    budgetItems: results,
  };
};
