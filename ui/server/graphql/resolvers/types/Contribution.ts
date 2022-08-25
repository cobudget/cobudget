import prisma from "../../../prisma";

export const bucket = async (contribution) => {
  return prisma.bucket.findUnique({
    where: { id: contribution.bucketId },
  });
};

export const round = async (contribution) => {
  return prisma.round.findUnique({
    where: { id: contribution.roundId },
  });
};

export const roundMember = async (contribution) => {
  return prisma.roundMember.findUnique({
    where: { id: contribution.roundMemberId },
  });
};
