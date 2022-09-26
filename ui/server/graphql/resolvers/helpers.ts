import dayjs from "dayjs";
import { skip } from "graphql-resolvers";
import stripe from "server/stripe";
import prisma from "../../prisma";
import fetch from "node-fetch";

export async function isCollOrGroupAdmin(
  parent,
  { roundId: roundIdArg },
  { user, ss = null }
) {
  if (!user) throw new Error("You need to be logged in");
  if (ss) return skip;

  const roundId = roundIdArg ?? parent.id;

  const roundMember = await getRoundMember({
    userId: user.id,
    roundId,
  });
  let groupMember = null;
  if (!roundMember?.isAdmin) {
    const group = await prisma.group.findFirst({
      where: { rounds: { some: { id: roundId } } },
    });
    groupMember = await getGroupMember({
      userId: user.id,
      groupId: group?.id,
    });
  }

  if (!(roundMember?.isAdmin || groupMember?.isAdmin))
    throw new Error("You need to be admin of the round or the group");
  return skip;
}

export async function isCollAdmin({ roundId, userId, ss }) {
  if (ss) return true;
  const roundMember = await getRoundMember({
    userId: userId,
    roundId,
  });
  return !!roundMember?.isAdmin;
}

export async function isAndGetCollMember({
  roundId,
  userId,
  bucketId,
  include,
}: {
  roundId?: string;
  bucketId?: string;
  userId?: string;
  include?: object;
}) {
  let collMember = null;
  if (bucketId) {
    collMember = await prisma.roundMember.findFirst({
      where: { buckets: { some: { id: bucketId } } },
      include,
    });
  } else if (roundId) {
    collMember = await prisma.roundMember.findUnique({
      where: {
        userId_roundId: { userId, roundId },
      },
      include,
    });
  }

  if (!collMember?.isApproved)
    throw new Error("Non existing or non approved round member");

  return collMember;
}

export async function isAndGetCollMemberOrGroupAdmin({
  roundId,
  userId,
  bucketId,
  include,
}: {
  roundId?: string;
  bucketId?: string;
  userId?: string;
  include?: object;
}) {
  let collMember = null;
  let groupMember = null;

  if (bucketId) {
    collMember = await prisma.roundMember.findFirst({
      where: { buckets: { some: { id: bucketId } } },
      include,
    });
  } else if (roundId) {
    collMember = await prisma.roundMember.findUnique({
      where: {
        userId_roundId: { userId, roundId },
      },
      include,
    });
  }
  if (!collMember) {
    groupMember = await prisma.groupMember.findFirst({
      where: { group: { rounds: { some: { id: roundId } } } },
    });
  }

  if (!groupMember?.isAdmin || !collMember?.isApproved)
    throw new Error("Not a round member or an group admin");

  return { collMember, groupMember };
}

export async function getGroupMember({ groupId, userId }) {
  return prisma.groupMember.findUnique({
    where: {
      groupId_userId: { groupId: groupId, userId },
    },
  });
}

export async function getRoundMember({
  roundId,
  userId,
  include,
  bucketId,
}: {
  roundId?: string;
  userId: string;
  include?: object;
  bucketId?: string;
}) {
  let roundMember = null;

  if (bucketId) {
    roundMember = await prisma.roundMember.findFirst({
      where: { round: { buckets: { some: { id: bucketId } } }, userId },
      include,
    });
  } else if (roundId) {
    roundMember = await prisma.roundMember.findUnique({
      where: {
        userId_roundId: { userId, roundId },
      },
      include,
    });
  }
  if (!roundMember?.isApproved) {
    throw new Error("Not a round member ");
  }

  return roundMember;
}

export async function getCurrentGroupAndMember({
  groupId,
  roundId,
  bucketId,
  user,
}: {
  groupId?: string;
  roundId?: string;
  bucketId?: string;
  user?: any;
}) {
  let currentGroup = null;

  const include = {
    ...(user && {
      groupMembers: { where: { userId: user.id }, include: { user: true } },
    }),
    discourse: true,
  };

  if (groupId) {
    currentGroup = await prisma.group.findUnique({
      where: { id: groupId },
      include,
    });
  } else if (roundId) {
    currentGroup = await prisma.group.findFirst({
      where: { rounds: { some: { id: roundId } } },
      include: {
        ...(user && {
          groupMembers: {
            where: { userId: user.id },
          },
        }),
        discourse: true,
      },
    });
  } else if (bucketId) {
    currentGroup = await prisma.group.findFirst({
      where: { rounds: { some: { buckets: { some: { id: bucketId } } } } },
      include,
    });
  }

  const currentGroupMember = currentGroup?.groupMembers?.[0];
  const roundMember = currentGroupMember?.roundMemberships?.[0];
  return { currentGroup, currentGroupMember, roundMember };
}

/** contributions = donations */
export async function bucketTotalContributions(bucket) {
  const contributions = await prisma.bucket
    .findUnique({ where: { id: bucket.id } })
    .Contributions();
  return contributions.reduce((acc, curr) => acc + curr.amount, 0);

  const {
    _sum: { amount },
  } = await prisma.contribution.aggregate({
    _sum: { amount: true },
    where: {
      bucketId: bucket.id,
    },
  });
  return amount;
}

/** income = existing funding */
export async function bucketIncome(bucket) {
  const budgetItems = await prisma.bucket
    .findUnique({ where: { id: bucket.id } })
    .BudgetItems();

  return budgetItems.reduce(
    (acc, curr) => acc + (curr.type == "INCOME" ? curr.min : 0),
    0
  );
}

export async function bucketMinGoal(bucket) {
  const budgetItems = await prisma.bucket
    .findUnique({ where: { id: bucket.id } })
    .BudgetItems();
  const sumMinExpenses = budgetItems.reduce(
    (acc, curr) => acc + (curr.type == "EXPENSE" ? curr.min : 0),
    0
  );
  return sumMinExpenses > 0 ? sumMinExpenses : 0;
}

export async function bucketMaxGoal(bucket) {
  const budgetItems = await prisma.bucket
    .findUnique({ where: { id: bucket.id } })
    .BudgetItems();
  const sumMaxExpenses = budgetItems.reduce(
    (acc, curr) => acc + (curr.type == "EXPENSE" ? curr.max ?? curr.min : 0),
    0
  );

  return sumMaxExpenses > 0 ? sumMaxExpenses : 0;
}

export function isGrantingOpen(round) {
  const now = dayjs();
  const grantingHasOpened = round.grantingOpens
    ? dayjs(round.grantingOpens).isBefore(now)
    : true;
  const grantingHasClosed = round.grantingCloses
    ? dayjs(round.grantingCloses).isBefore(now)
    : false;
  return grantingHasOpened && !grantingHasClosed;
}

export function statusTypeToQuery(statusType) {
  switch (statusType) {
    case "PENDING_APPROVAL":
      return {
        approvedAt: null,
        deleted: false,
      };
    case "OPEN_FOR_FUNDING":
      return {
        approvedAt: { not: null },
        fundedAt: null,
        completedAt: null,
        canceledAt: null,
        deleted: false,
      };
    case "FUNDED":
      return {
        fundedAt: { not: null },
        canceledAt: null,
        completedAt: null,
        deleted: false,
      };
    case "CANCELED":
      return {
        canceledAt: { not: null },
        deleted: false,
      };
    case "COMPLETED":
      return {
        completedAt: { not: null },
        deleted: false,
      };
    default:
      return false;
  }
}

export async function canViewRound({ round, user }) {
  if (round.visibility === "PUBLIC") {
    return true;
  }
  const roundMember = await prisma.roundMember.findUnique({
    where: {
      userId_roundId: {
        userId: user?.id ?? "undefined",
        roundId: round.id,
      },
    },
  });

  if (roundMember?.isApproved) {
    return true;
  } else {
    return false;
  }
}

export async function roundMemberBalance(member) {
  if (!member.statusAccountId) return 0;

  // console.time("memberBalanceTransactions");
  // const {
  //   _sum: { amount: debit },
  // } = await prisma.transaction.aggregate({
  //   where: { toAccountId: member.statusAccountId },
  //   _sum: { amount: true },
  // });

  // const {
  //   _sum: { amount: credit },
  // } = await prisma.transaction.aggregate({
  //   where: { fromAccountId: member.statusAccountId },
  //   _sum: { amount: true },
  // });

  // console.timeEnd("memberBalanceTransactions");

  // const debitMinusCredit = debit - credit;

  // console.time("memberBalanceAllocationsAndContributions");

  const {
    _sum: { amount: totalAllocations },
  } = await prisma.allocation.aggregate({
    where: { roundMemberId: member.id },
    _sum: { amount: true },
  });

  const {
    _sum: { amount: totalContributions },
  } = await prisma.contribution.aggregate({
    where: { roundMemberId: member.id },
    _sum: { amount: true },
  });

  // console.timeEnd("memberBalanceAllocationsAndContributions");

  // if (debitMinusCredit !== (totalAllocations - totalContributions)) {
  //   console.error("Member balance is not adding up");
  // }

  return totalAllocations - totalContributions;
}

/** only call this if you've verified the user is at least a round admin */
export async function stripeIsConnected({ round }) {
  if (!round.stripeAccountId) {
    return false;
  }

  // this seems to take approx 400-700ms
  const account = await stripe.accounts.retrieve(round.stripeAccountId);

  return account.charges_enabled;
}

export async function updateFundedPercentage(bucket) {
  try {
    const total = await bucketTotalContributions(bucket);
    const minGoal = await bucketMinGoal(bucket);
    const income = await bucketIncome(bucket);
    const percentageFunded =
      Math.floor(((total + income) / minGoal) * 10000) / 100;
    return prisma.bucket.update({
      where: { id: bucket.id },
      data: {
        percentageFunded,
      },
    });
  } catch (err) {
    return err;
  }
}

export async function updateContributionsCount(bucket, inc = 1) {
  try {
    return prisma.bucket.update({
      where: { id: bucket.id },
      data: {
        contributionsCount: (bucket.contributionsCount || 0) + inc,
      },
    });
  } catch (err) {
    return err;
  }
}

export const getLanguageProgress = async () => {
  try {
    if (!process.env.CROWDIN_PROJECT_ID) return [];

    const res = await fetch(
      `https://api.crowdin.com/api/v2/projects/${process.env.CROWDIN_PROJECT_ID}/languages/progress`,
      {
        headers: {
          "Content-type": "application/json",
          Authorization: "Bearer " + process.env.CROWDIN_API_TOKEN,
        },
      }
    );
    const { data } = (await res.json()) as any;
    const progress = [];
    data.forEach((lang) => {
      progress.push({
        code: lang.data.languageId.split("-")[0],
        percentage: lang.data.translationProgress,
      });
    });
    return progress;
  } catch (err) {
    return [];
  }
};
