import prisma from "server/prisma";
import { getRoundMember } from "../helpers";
import { HIDDEN } from "../../../../constants";

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
    // Filtering via a relation (assumes budgetItem has a relation to Bucket)
    where.bucket = { status: { in: status } };
  }
  if (typeof minBudget === "number") {
    where.minBudget = { gte: minBudget };
  }
  if (typeof stretchBudget === "number") {
    where.stretchBudget = { gte: stretchBudget };
  }

  // 4. Query budget items (including the minimal bucket info needed).
  const [items, total] = await Promise.all([
    prisma.budgetItem.findMany({
      where,
      include: {
        bucket: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        [orderBy]: orderDir,
      },
    }),
    prisma.budgetItem.count({ where }),
  ]);

  const results = items.map((it) => ({
    id: it.id,
    description: it.description,
    minBudget: it.minBudget,
    stretchBudget: it.stretchBudget,
    bucket: it.bucket
      ? {
          id: it.bucket.id,
          title: it.bucket.title,
          status: it.bucket.status,
        }
      : null,
  }));

  return {
    total,
    moreExist: total > offset + items.length,
    budgetItems: results,
  };
};
