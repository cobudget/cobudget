import prisma from "server/prisma";
import { HIDDEN } from "../../../../constants";
import { getRoundMember } from "../helpers";
import { statusTypeToQuery, computeBucketStatus } from "../helpers/bucket";

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
    // Convert status strings to actual database conditions
    const orConditions = status
      .map((s: string) => statusTypeToQuery(s))
      .filter(Boolean);
    
    if (orConditions.length > 0) {
      where.bucket = { OR: orConditions };
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
        bucket: {
          select: {
            id: true,
            title: true,
            publishedAt: true,
            canceledAt: true,
            completedAt: true,
            funded: true,
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
    bucket: it.bucket
      ? {
          id: it.bucket.id,
          title: it.bucket.title,
          status: computeBucketStatus(it.bucket),
        }
      : null,
  }));

  return {
    total,
    moreExist: total > offset + items.length,
    budgetItems: results,
  };
};
