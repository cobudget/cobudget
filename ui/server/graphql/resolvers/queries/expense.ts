import prisma from "server/prisma";

export const expenses = async (
  _,
  { limit, offset, roundId, search, status, bucketId }
) => {
  const round = await prisma.round.findFirst({
    where: { id: roundId },
  });
  if (!round) {
    return [];
  }
  const response = await prisma.expense.findMany({
    where: {
      roundId: round.id,
      bucketId,
      status: { in: status },
      title: { contains: search, mode: "insensitive" },
    },
    take: limit || 10,
    skip: offset || 0,
  });
  const total = await prisma.expense.count({
    where: {
      roundId: round.id,
      bucketId,
      status: { in: status },
      title: { contains: search, mode: "insensitive" },
    },
  });

  return {
    expenses: response,
    total,
    moreExist: total > offset + limit,
  };
};

export const allExpenses = async () => {
  return prisma.expense.findMany();
};
