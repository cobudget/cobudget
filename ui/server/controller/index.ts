import dayjs from "dayjs";
import { Prisma, User, AllocationType, RoundMember } from "@prisma/client";
import importedPrisma from "../prisma";
import eventHub from "server/services/eventHub.service";
import {
  getRoundMember,
  bucketIncome,
  updateContributionsCount,
} from "../graphql/resolvers/helpers";
import { updateFundedPercentage } from "../graphql/resolvers/helpers";
import isGroupSubscriptionActive from "server/graphql/resolvers/helpers/isGroupSubscriptionActive";

export const allocateToMember = async ({
  roundId,
  amount,
  type,
  allocatedBy,
  member,
  stripeSessionId,
  prisma,
}: {
  roundId: string;
  amount: number;
  type: AllocationType;
  allocatedBy: string;
  member: RoundMember;
  stripeSessionId?: string;
  prisma: Prisma.TransactionClient;
}) => {
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

  const balance = totalAllocations - totalContributions;
  let adjustedAmount;
  if (type === "ADD") {
    adjustedAmount = balance + amount >= 0 ? amount : -balance;
  } else if (type === "SET") {
    if (amount < 0) throw new Error("Can't set negative values");

    adjustedAmount = amount - balance;
  }
  if (adjustedAmount === 0) return;

  try {
    await prisma.allocation.create({
      data: {
        roundId,
        roundMemberId: member.id,
        amount: adjustedAmount,
        amountBefore: balance,
        allocatedById: allocatedBy,
        allocationType: type,
        stripeSessionId,
      },
    });

    await prisma.transaction.create({
      data: {
        roundMemberId: allocatedBy,
        amount: adjustedAmount,
        toAccountId: member.statusAccountId,
        fromAccountId: member.incomingAccountId,
        roundId,
        stripeSessionId,
      },
    });

    await eventHub.publish("allocate-to-member", {
      roundMemberId: member.id,
      roundId,
      oldAmount: balance,
      newAmount: balance + adjustedAmount,
    });
  } catch (error) {
    throw new Error("Failed to allocate to member: " + error.message);
  }
};

export const bulkAllocate = async ({ roundId, amount, type, allocatedBy }) => {
  const prisma = importedPrisma;

  if (type === "SET" && amount < 0)
    throw new Error("Can't set negative values");

  const members = await prisma.roundMember.findMany({
    where: { roundId },
    include: {
      contributions: true,
      allocations: true,
      user: { include: { emailSettings: true } },
    },
  });

  const membersWithCalculatedData = members.map((member) => {
    const totalAllocations = member.allocations.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );
    const totalContributions = member.contributions.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );
    const balance = totalAllocations - totalContributions;
    let adjustedAmount;
    if (type === "ADD") {
      adjustedAmount = balance + amount >= 0 ? amount : -balance;
    } else if (type === "SET") {
      adjustedAmount = amount - balance;
    }
    return { ...member, adjustedAmount, balance };
  });
  const allocationData = membersWithCalculatedData.map((member) => ({
    roundId,
    roundMemberId: member.id,
    amount: member.adjustedAmount,
    amountBefore: member.balance,
    allocatedById: allocatedBy,
    allocationType: type,
  }));
  const transactionData = membersWithCalculatedData.map((member) => ({
    roundMemberId: allocatedBy,
    amount: member.adjustedAmount,
    toAccountId: member.statusAccountId,
    fromAccountId: member.incomingAccountId,
    roundId,
  }));
  try {
    await prisma.$transaction([
      prisma.allocation.createMany({ data: allocationData }),
      prisma.transaction.createMany({ data: transactionData }),
    ]);

    await eventHub.publish("bulk-allocate", {
      roundId,
      membersData: membersWithCalculatedData,
    });
  } catch (error) {
    throw new Error("Failed to allocate to members: " + error.message);
  }
};

export const getGroup = async ({
  groupId,
  groupSlug,
  user,
  ss,
}: {
  groupId?: string;
  groupSlug?: string;
  user: { id: string };
  ss?: { id: string };
}) => {
  try {
    const prisma = importedPrisma;
    const group = await prisma.group.findUnique({
      where: groupId ? { id: groupId } : { slug: groupSlug },
    });
    if (group?.visibility === "PUBLIC") return group;

    if (!user) throw "This group is private";

    const currentGroupMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId: group.id, userId: user.id },
      },
    });

    if (currentGroupMember || ss) return group;

    throw "The group is private";
  } catch (err) {
    const group = await importedPrisma.group.findUnique({
      where: groupId ? { id: groupId } : { slug: groupSlug },
    });
    if (group) {
      return {
        slug: group.slug,
        id: group.id,
        name: group.name,
        stripeSubscriptionId: group.stripeSubscriptionId,
      };
    } else return null;
  }
};

export const contribute = async ({
  roundId,
  bucketId,
  amount,
  user,
  stripeSessionId,
  prisma = importedPrisma,
}: {
  roundId: string;
  bucketId: string;
  amount: number;
  user: User;
  stripeSessionId?: string;
  prisma?: Prisma.TransactionClient;
}) => {
  const roundMember = await getRoundMember({
    roundId,
    userId: user.id,
    include: { round: true },
  });

  const { round } = roundMember;

  await isGroupSubscriptionActive({ groupId: round?.groupId });

  if (amount <= 0) throw new Error("Value needs to be more than zero");

  // Check that granting is open
  const now = dayjs();
  const grantingHasOpened = round.grantingOpens
    ? dayjs(round.grantingOpens).isBefore(now)
    : true;
  const grantingHasClosed = round.grantingCloses
    ? dayjs(round.grantingCloses).isBefore(now)
    : false;
  const grantingIsOpen = grantingHasOpened && !grantingHasClosed;
  if (!grantingIsOpen) throw new Error("Funding is not open");

  let bucket = await prisma.bucket.findUnique({ where: { id: bucketId } });

  if (bucket.roundId !== roundId) throw new Error("Bucket not in round");

  if (!bucket.approvedAt) throw new Error("Bucket is not approved for funding");

  if (bucket.canceledAt)
    throw new Error("Funding has been canceled for bucket");

  if (bucket.fundedAt) throw new Error("Bucket has been funded");

  if (bucket.completedAt) throw new Error("Bucket is already completed");

  // Check that the max goal of the bucket is not exceeded
  const {
    _sum: { amount: contributionsForBucket },
  } = await prisma.contribution.aggregate({
    where: { bucketId: bucket.id },
    _sum: { amount: true },
  });

  const budgetItems = await prisma.budgetItem.findMany({
    where: { bucketId: bucket.id, type: "EXPENSE" },
  });

  const maxGoal = budgetItems.reduce(
    (acc, item) => acc + (item.max ? item.max : item.min),
    0
  );

  if (contributionsForBucket + amount > maxGoal)
    throw new Error("You can't overfund this bucket.");

  // mark bucket as funded if it has reached its max goal
  if (contributionsForBucket + amount === maxGoal) {
    bucket = await prisma.bucket.update({
      where: { id: bucketId },
      data: { fundedAt: new Date() },
    });
  }

  // Check that it is not more than is allowed per bucket (if this number is set)
  const {
    _sum: { amount: contributionsFromUserToThisBucket },
  } = await prisma.contribution.aggregate({
    where: {
      bucketId: bucket.id,
      roundMemberId: roundMember.id,
    },
    _sum: { amount: true },
  });

  if (
    round.maxAmountToBucketPerUser &&
    amount + contributionsFromUserToThisBucket > round.maxAmountToBucketPerUser
  ) {
    throw new Error(
      `You can give a maximum of ${round.maxAmountToBucketPerUser / 100} ${
        round.currency
      } to one bucket`
    );
  }

  // Check that user has not spent more tokens than he has
  const {
    _sum: { amount: contributionsFromUser },
  } = await prisma.contribution.aggregate({
    where: {
      roundMemberId: roundMember.id,
    },
    _sum: { amount: true },
  });

  const {
    _sum: { amount: allocationsForUser },
  } = await prisma.allocation.aggregate({
    where: {
      roundMemberId: roundMember.id,
    },
    _sum: { amount: true },
  });

  if (contributionsFromUser + amount > allocationsForUser)
    throw new Error("You are trying to spend more than what you have.");

  await prisma.contribution.create({
    data: {
      roundId,
      roundMemberId: roundMember.id,
      amount,
      bucketId: bucket.id,
      amountBefore: contributionsForBucket || 0,
      stripeSessionId,
    },
  });

  await prisma.transaction.create({
    data: {
      roundMemberId: roundMember.id,
      amount,
      toAccountId: bucket.statusAccountId,
      fromAccountId: roundMember.statusAccountId,
      roundId,
      stripeSessionId,
    },
  });

  await updateFundedPercentage(bucket);

  await eventHub.publish("contribute-to-bucket", {
    round,
    bucket,
    contributingUser: user,
    amount,
  });

  await updateContributionsCount(bucket);

  return bucket;
};
