import prisma from "../prisma";
import eventHub from "server/services/eventHub.service";

export const allocateToMember = async ({
  collectionMemberId,
  collectionId,
  amount,
  type,
}) => {
  const {
    _sum: { amount: totalAllocations },
  } = await prisma.allocation.aggregate({
    where: { collectionMemberId },
    _sum: { amount: true },
  });

  const {
    _sum: { amount: totalContributions },
  } = await prisma.contribution.aggregate({
    where: { collectionMemberId },
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
      collectionMemberId,
      amount: adjustedAmount,
    },
  });
  await eventHub.publish("allocate-to-member", {
    collectionMemberId,
    collectionId,
    oldAmount: balance,
    newAmount: balance + adjustedAmount,
    type,
  });
};
