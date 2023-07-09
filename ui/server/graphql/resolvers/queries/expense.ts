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
  return prisma.expense.findMany({
    where: {
      roundId: round.id,
      bucketId,
      status: { in: status },
      title: { contains: search, mode: "insensitive" },
    },
    take: limit || 10,
    skip: offset || 0,
  });
};
