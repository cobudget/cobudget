import prisma from "../prisma";
import eventHub from "server/services/eventHub.service";

export const allocateToMember = async ({
  roundId,
  amount,
  type,
  allocatedBy,
  member,
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
  await prisma.allocation.create({
    data: {
      roundId,
      roundMemberId: member.id,
      amount: adjustedAmount,
      amountBefore: balance,
      allocatedById: allocatedBy,
      allocationType: type,
    },
  });

  await prisma.transaction.create({
    data: {
      roundMemberId: allocatedBy,
      amount: adjustedAmount,
      toAccountId: member.statusAccountId,
      fromAccountId: member.incomingAccountId,
      roundId,
    },
  });

  await eventHub.publish("allocate-to-member", {
    roundMemberId: member.id,
    roundId,
    oldAmount: balance,
    newAmount: balance + adjustedAmount,
  });
};
