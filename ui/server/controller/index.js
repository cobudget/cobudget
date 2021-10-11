import prisma from "../prisma";

export const allocateToMember = async ({
  collectionMemberId,
  eventId,
  organizationId,
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
      organizationId,
      collectionId: eventId,
      collectionMemberId,
      amount: adjustedAmount,
    },
  });
};
