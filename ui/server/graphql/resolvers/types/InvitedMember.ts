import prisma from "../../../prisma";

export const round = async ({ roundId }) => {
  if (roundId) {
    return prisma.round.findUnique({ where: { id: roundId } });
  }
  return null;
};
export const group = async ({ groupId }) => {
  if (groupId) {
    return prisma.group.findUnique({ where: { id: groupId } });
  }
  return null;
};
