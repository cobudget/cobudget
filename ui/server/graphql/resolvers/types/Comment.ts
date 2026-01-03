import prisma from "../../../prisma";

export const roundMember = async (comment) => {
  // make logs anonymous
  if (comment.isLog) return null;

  // Use pre-included collMember if available (from commentSet optimization)
  if (comment.collMember && typeof comment.collMember === "object") {
    return comment.collMember;
  }

  return prisma.roundMember.findUnique({
    where: {
      id: comment.collMemberId,
    },
  });
};
