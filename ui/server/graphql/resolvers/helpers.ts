import prisma from "../../prisma";
import dayjs from "dayjs";

export async function isCollAdmin({ collectionId, userId }) {
  const collectionMember = await getCollectionMember({
    userId: userId,
    collectionId,
  });
  return !!collectionMember?.isAdmin;
}

export async function isAndGetCollMember({
  collectionId,
  userId,
  bucketId,
  include,
}: {
  collectionId?: string;
  bucketId?: string;
  userId?: string;
  include?: object;
}) {
  let collMember = null;
  if (bucketId) {
    collMember = await prisma.collectionMember.findFirst({
      where: { buckets: { some: { id: bucketId } } },
      include,
    });
  } else if (collectionId) {
    collMember = await prisma.collectionMember.findUnique({
      where: {
        userId_collectionId: { userId, collectionId },
      },
      include,
    });
  }

  if (!collMember?.isApproved)
    throw new Error("Non existing or non approved collection member");

  return collMember;
}

export async function isAndGetCollMemberOrOrgAdmin({
  collectionId,
  userId,
  bucketId,
  include,
}: {
  collectionId?: string;
  bucketId?: string;
  userId?: string;
  include?: object;
}) {
  let collMember = null;
  let orgMember = null;

  if (bucketId) {
    collMember = await prisma.collectionMember.findFirst({
      where: { buckets: { some: { id: bucketId } } },
      include,
    });
  } else if (collectionId) {
    collMember = await prisma.collectionMember.findUnique({
      where: {
        userId_collectionId: { userId, collectionId },
      },
      include,
    });
  }
  if (!collMember) {
    orgMember = await prisma.orgMember.findFirst({
      where: { organization: { collections: { some: { id: collectionId } } } },
    });
  }

  if (!orgMember?.isAdmin || !collMember?.isApproved)
    throw new Error("Not a collection member or an org admin");

  return { collMember, orgMember };
}

export async function getOrgMember({ orgId, userId }) {
  return prisma.orgMember.findUnique({
    where: {
      organizationId_userId: { organizationId: orgId, userId },
    },
  });
}

export async function getCollectionMember({
  collectionId,
  userId,
  include,
  bucketId,
}: {
  collectionId?: string;
  userId: string;
  include?: object;
  bucketId?: string;
}) {
  let collMember = null;

  if (bucketId) {
    collMember = await prisma.collectionMember.findFirst({
      where: { collection: { buckets: { some: { id: bucketId } } }, userId },
      include,
    });
  } else if (collectionId) {
    collMember = await prisma.collectionMember.findUnique({
      where: {
        userId_collectionId: { userId, collectionId },
      },
      include,
    });
  }
  if (!collMember?.isApproved) {
    throw new Error("Not a collection member ");
  }

  return collMember;
}

export async function getCurrentOrgAndMember({
  orgId,
  collectionId,
  bucketId,
  user,
}: {
  orgId?: string;
  collectionId?: string;
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
  } else if (collectionId) {
    currentOrg = await prisma.organization.findFirst({
      where: { collections: { some: { id: collectionId } } },
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
      where: { collections: { some: { buckets: { some: { id: bucketId } } } } },
      include,
    });
  }

  const currentOrgMember = currentOrg?.orgMembers?.[0];
  const collectionMember = currentOrgMember?.collectionMemberships?.[0];
  return { currentOrg, currentOrgMember, collectionMember };
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

export function isGrantingOpen(collection) {
  const now = dayjs();
  const grantingHasOpened = collection.grantingOpens
    ? dayjs(collection.grantingOpens).isBefore(now)
    : true;
  const grantingHasClosed = collection.grantingCloses
    ? dayjs(collection.grantingCloses).isBefore(now)
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
  const roundMember = await prisma.collectionMember.findUnique({
    where: {
      userId_collectionId: {
        userId: user?.id ?? "undefined",
        collectionId: round.id,
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
    where: { collectionMemberId: member.id },
    _sum: { amount: true },
  });

  const {
    _sum: { amount: totalContributions },
  } = await prisma.contribution.aggregate({
    where: { collectionMemberId: member.id },
    _sum: { amount: true },
  });

  // console.timeEnd("memberBalanceAllocationsAndContributions");

  // if (debitMinusCredit !== (totalAllocations - totalContributions)) {
  //   console.error("Member balance is not adding up");
  // }

  return totalAllocations - totalContributions;
}
