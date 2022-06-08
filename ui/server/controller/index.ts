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
  if (adjustedAmount === 0) return;

  try {
    await prisma.$transaction([
      prisma.allocation.create({
        data: {
          roundId,
          roundMemberId: member.id,
          amount: adjustedAmount,
          amountBefore: balance,
          allocatedById: allocatedBy,
          allocationType: type,
        },
      }),
      prisma.transaction.create({
        data: {
          roundMemberId: allocatedBy,
          amount: adjustedAmount,
          toAccountId: member.statusAccountId,
          fromAccountId: member.incomingAccountId,
          roundId,
        },
      })])

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
  if (type === "SET" && amount < 0) throw new Error("Can't set negative values");

  const members = await prisma.roundMember.findMany({ where: { roundId }, include: { contributions: true, allocations: true, user: { include: { emailSettings: true } } } });

  const membersWithCalculatedData = members.map(member => {
    const totalAllocations = member.allocations.reduce((acc, curr) => acc + curr.amount, 0);
    const totalContributions = member.contributions.reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalAllocations - totalContributions;
    let adjustedAmount;
    if (type === "ADD") {
      adjustedAmount = balance + amount >= 0 ? amount : -balance;
    } else if (type === "SET") {
      adjustedAmount = amount - balance;
    }
    return { ...member, adjustedAmount, balance };
  });
  const allocationData = membersWithCalculatedData.map(member => ({ roundId, roundMemberId: member.id, amount: member.adjustedAmount, amountBefore: member.balance, allocatedById: allocatedBy, allocationType: type }));
  const transactionData = membersWithCalculatedData.map(member => ({ roundMemberId: allocatedBy, amount: member.adjustedAmount, toAccountId: member.statusAccountId, fromAccountId: member.incomingAccountId, roundId }));
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

