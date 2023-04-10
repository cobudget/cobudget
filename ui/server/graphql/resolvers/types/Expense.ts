import prisma from "server/prisma";
import { getRoundMember } from "../helpers";

export const amount = async ({ id }) => {
  const result = await prisma.expenseReceipt.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      expenseId: id,
    },
  });
  return result._sum.amount || 0;
};

export const receipts = async (
  { id, bucketId, submittedBy },
  _,
  { ss, user }
) => {
  const bucket = await prisma.bucket.findFirst({ where: { id: bucketId } });
  const roundMember = await getRoundMember({
    roundId: bucket?.roundId,
    userId: user?.id,
    bucketId,
  });

  if (
    ss ||
    roundMember?.isAdmin ||
    roundMember?.isModerator ||
    roundMember?.id === submittedBy
  ) {
    return prisma.expenseReceipt.findMany({
      where: {
        expenseId: id,
      },
    });
  } else {
    throw new Error("Not allowed");
  }
};
