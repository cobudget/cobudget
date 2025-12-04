import prisma from "server/prisma";
import arraySort from "array-sort";
import {
  GRAPHQL_EXPENSES_PARTICIPANT_ONLY,
  HIDDEN,
} from "../../../../constants";
import { getRoundMember } from "../helpers";

export const expenses = async (
  _,
  { limit, offset, roundId, search, status, bucketId, sortBy, sortOrder },
  { user, ss }
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

  if (round.visibility === HIDDEN) {
    let roundMember;
    if (user) {
      roundMember = await getRoundMember({
        userId: user?.id,
        roundId,
      });
    }
    if (!roundMember?.isApproved) {
      return {
        expenses: [],
        total: 0,
        moreExist: false,
        error: GRAPHQL_EXPENSES_PARTICIPANT_ONLY,
      };
    }
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
      include: {
        receipts: {
          select: {
            amount: true,
          },
        },
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
      include: {
        receipts: {
          select: {
            amount: true,
          },
        },
      },
      ...(sortBy === "bucketTitle" && {
        include: {
          receipts: {
            select: {
              amount: true,
            },
          },
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

  // Determine if the current user is allowed to view protected fields
  let canViewProtectedFields = false;

  if (user) {
    // Check for superadmin (assumes user.isSuperAdmin flag is set)
    if (user.isSuperAdmin) {
      canViewProtectedFields = true;
    } else {
      // Check if the user is a round admin
      const roundMember = await getRoundMember({ userId: user.id, roundId });
      if (roundMember && roundMember.isAdmin) {
        canViewProtectedFields = true;
      }
      // If not a round admin, check if the user is a group admin
      else if (round.groupId) {
        const groupAdmin = await prisma.groupMember.findFirst({
          where: {
            groupId: round.groupId,
            userId: user.id,
            isAdmin: true,
          },
        });
        if (groupAdmin) {
          canViewProtectedFields = true;
        }
      }
    }
  }

  // If the user is not allowed, remove protected fields from all expenses
  if (!canViewProtectedFields) {
    response = response.map((expense) => ({
      ...expense,
      recipientName: null,
      recipientEmail: null,
      swiftCode: null,
      iban: null,
      country: null,
      city: null,
      recipientAddress: null,
      recipientPostalCode: null,
    }));
  }

  return {
    expenses: response,
    total,
    moreExist: total > offset + limit,
  };
};

export const allExpenses = async () => {
  return [];
};
