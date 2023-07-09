import prisma from "server/prisma";

export const expenses = async (
  _,
  { limit, offset, roundSlug, groupSlug, search, status, bucketId }
) => {
  const group = await prisma.group.findFirst({ where: { slug: groupSlug } });
  const round = await prisma.round.findFirst({
    where: { slug: roundSlug, groupId: group?.id },
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
