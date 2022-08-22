import prisma from "../../../prisma";

export const roundMember = async (comment) => {
  // make logs anonymous
  if (comment.isLog) return null;

  return prisma.roundMember.findUnique({
    where: {
      id: comment.collMemberId,
    },
  });
};
