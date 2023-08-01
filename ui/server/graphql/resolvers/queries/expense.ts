import prisma from "server/prisma";
import arraySort from "array-sort";

export const expenses = async (
  _,
  { limit, offset, roundId, search, status, bucketId, sortBy, sortOrder }
) => {
  let response = [];

  const round = await prisma.round.findFirst({
    where: { id: roundId },
  });
  if (!round) {
    return {
      expenses: [],
      total: 0,
      moreExist: false,
    };
  }

  if (sortBy === "amount") {
    const grouped = await prisma.expenseReceipt.groupBy({
      by: ["expenseId"],
      _sum: {
        amount: true,
      },
      where: {
        expense: {
          roundId,
          bucketId,
          status: { in: status },
          title: { contains: search, mode: "insensitive" },
        },
      },
      take: limit || 10,
      skip: offset || 0,
      orderBy: {
        _sum: {
          amount: sortOrder || "desc",
        },
      },
    });
    const expenseIds = grouped.map((g) => g.expenseId);
    const expenses = await prisma.expense.findMany({
      where: {
        id: { in: expenseIds },
      },
    });
    const expensesWithAmount = expenses.map((e) => ({
      ...e,
      amount: grouped.find((g) => g.expenseId === e.id)._sum.amount,
    }));
    response = arraySort(expensesWithAmount, "amount", {
      reverse: sortOrder === "desc",
    });
  } else {
    //Simple sort is a sort that does not require a join
    const isSimpleSort =
      !sortBy ||
      sortBy === "createdAt" ||
      sortBy === "status" ||
      sortBy === "title";
    response = await prisma.expense.findMany({
      where: {
        roundId: round.id,
        bucketId,
        status: { in: status },
        title: { contains: search, mode: "insensitive" },
      },
      ...(sortBy === "bucketTitle" && {
        include: {
          bucket: {
            select: {
              title: true,
            },
          },
        },
      }),
      take: limit || 10,
      skip: offset || 0,
      ...(isSimpleSort && {
        orderBy: {
          [sortBy || "createdAt"]: sortOrder || "desc",
        },
      }),
      ...(sortBy === "bucketTitle" && {
        orderBy: {
          bucket: {
            title: sortOrder || "desc",
          },
        },
      }),
    });
  }

  const total = await prisma.expense.count({
    where: {
      roundId: round.id,
      bucketId,
      status: { in: status },
      title: { contains: search, mode: "insensitive" },
    },
  });

  return {
    expenses: response,
    total,
    moreExist: total > offset + limit,
  };
};

export const allExpenses = async () => {
  return prisma.expense.findMany();
};
