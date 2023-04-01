import prisma from "server/prisma";

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

export const receipts = async ({ id }) => {
  return prisma.expenseReceipt.findMany({
    where: {
      expenseId: id,
    },
  });
};
