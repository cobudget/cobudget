import prisma from "../prisma";
import eventHub from "server/services/eventHub.service";

export const allocateToMember = async ({
  collectionId,
  amount,
  type,
  allocatedBy,
  member,
}) => {
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
      collectionId,
      collectionMemberId: member.id,
      amount: adjustedAmount,
      amountBefore: balance,
      allocatedById: allocatedBy,
      allocationType: type,
    },
  });

  await prisma.transaction.create({
    data: {
      collectionMemberId: allocatedBy,
      type: "ALLOCATION",
      amount: adjustedAmount,
      toAccountId: member.statusAccountId,
      fromAccountId: member.incomingAccountId,
    },
  });

  await eventHub.publish("allocate-to-member", {
    collectionMemberId: member.id,
    collectionId,
    oldAmount: balance,
    newAmount: balance + adjustedAmount,
  });
};
