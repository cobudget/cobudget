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
  // null roundMemberId = anonymous funder (C-06 silent allocation).
  // Return the synthetic roundMember embedded by the funders resolver.
  if (!contribution.roundMemberId) return contribution.roundMember ?? null;
  return prisma.roundMember.findUnique({
    where: { id: contribution.roundMemberId },
  });
};
