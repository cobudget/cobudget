import prisma from "../../prisma";
import dayjs from "dayjs";

export async function getCurrentCollMember({ collMemberId }) {}

export async function isCollAdmin({ roundId, userId }) {
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

export async function isAndGetCollMemberOrOrgAdmin({
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
  let orgMember = null;

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
    orgMember = await prisma.orgMember.findFirst({
      where: { organization: { rounds: { some: { id: roundId } } } },
    });
  }

  if (!orgMember?.isAdmin || !collMember?.isApproved)
    throw new Error("Not a round member or an org admin");

  return { collMember, orgMember };
}

export async function getOrgMember({ orgId, userId }) {
  return prisma.orgMember.findUnique({
    where: {
      organizationId_userId: { organizationId: orgId, userId },
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
  let collMember = null;

  if (bucketId) {
    collMember = await prisma.roundMember.findFirst({
      where: { round: { buckets: { some: { id: bucketId } } }, userId },
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
  if (!collMember?.isApproved) {
    throw new Error("Not a round member ");
  }

  return collMember;
}

export async function getCurrentOrgAndMember({
  orgId,
  roundId,
  bucketId,
  user,
}: {
  orgId?: string;
  roundId?: string;
  bucketId?: string;
  user?: any;
}) {
  let currentOrg = null;

  const include = {
    ...(user && {
      orgMembers: { where: { userId: user.id }, include: { user: true } },
    }),
    discourse: true,
  };

  if (orgId) {
    currentOrg = await prisma.organization.findUnique({
      where: { id: orgId },
      include,
    });
  } else if (roundId) {
    currentOrg = await prisma.organization.findFirst({
      where: { rounds: { some: { id: roundId } } },
      include: {
        ...(user && {
          orgMembers: {
            where: { userId: user.id },
          },
        }),
        discourse: true,
      },
    });
  } else if (bucketId) {
    currentOrg = await prisma.organization.findFirst({
      where: { rounds: { some: { buckets: { some: { id: bucketId } } } } },
      include,
    });
  }

  const currentOrgMember = currentOrg?.orgMembers?.[0];
  const roundMember = currentOrgMember?.roundMemberships?.[0];
  return { currentOrg, currentOrgMember, roundMember };
}

/** contributions = donations */
export async function bucketTotalContributions(bucket) {
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
  const {
    _sum: { min },
  } = await prisma.budgetItem.aggregate({
    _sum: { min: true },
    where: {
      bucketId: bucket.id,
      type: "INCOME",
    },
  });
  return min;
}

export async function bucketMinGoal(bucket) {
  const {
    _sum: { min },
  } = await prisma.budgetItem.aggregate({
    _sum: { min: true },
    where: {
      bucketId: bucket.id,
      type: "EXPENSE",
    },
  });
  return min > 0 ? min : 0;
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
      };
    case "OPEN_FOR_FUNDING":
      return {
        approvedAt: { not: null },
        fundedAt: null,
        completedAt: null,
        canceledAt: null,
      };
    case "FUNDED":
      return {
        fundedAt: { not: null },
        canceledAt: null,
        completedAt: null,
      };
    case "CANCELED":
      return {
        canceledAt: { not: null },
      };
    case "COMPLETED":
      return {
        completedAt: { not: null },
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
