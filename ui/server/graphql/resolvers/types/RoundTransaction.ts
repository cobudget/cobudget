import prisma from "../../../prisma";

export const roundMember = async (transaction) => {
  return prisma.roundMember.findUnique({
    where: { id: transaction.roundMemberId },
  });
};
export const allocatedBy = async (transaction) => {
  if (transaction.allocatedById)
    return prisma.roundMember.findUnique({
      where: { id: transaction.allocatedById },
    });
  else return null;
};
export const bucket = async (transaction) => {
  if (transaction.bucketId)
    return prisma.bucket.findUnique({
      where: { id: transaction.bucketId },
    });
  else return null;
};
export const round = async (transaction) => {
  return prisma.round.findUnique({
    where: { id: transaction.roundId },
  });
};
