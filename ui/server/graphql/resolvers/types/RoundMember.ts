import prisma from "../../../prisma";
import { roundMemberBalance } from "../helpers";

export const round = async (member) => {
  // Use pre-included round if available
  if (member.round && typeof member.round === "object") {
    return member.round;
  }
  return await prisma.round.findUnique({
    where: { id: member.roundId },
  });
};

export const user = async (member) => {
  // Use pre-included user if available (from membersPage optimization)
  if (member.user && typeof member.user === "object") {
    return member.user;
  }
  return prisma.user.findUnique({
    where: { id: member.userId },
  });
};

export const balance = async (member) => {
  // Use pre-computed balance if available (from membersPage optimization)
  if (member._computed?.balance !== undefined) {
    return member._computed.balance;
  }
  return roundMemberBalance(member);
};

export const email = async (member, _, { user: currentUser, ss }) => {
  if (!currentUser) return null;
  const currentCollMember = await prisma.roundMember.findUnique({
    where: {
      userId_roundId: {
        userId: currentUser.id,
        roundId: member.roundId,
      },
    },
  });

  if (!(ss || currentCollMember?.isAdmin || currentCollMember?.id == member.id))
    return null;

  // Use pre-included user if available
  if (member.user && typeof member.user === "object") {
    return member.user.email;
  }

  const u = await prisma.user.findFirst({
    where: {
      collMemberships: {
        some: { id: member.id },
      },
    },
  });
  return u?.email;
};

export const name = async (member, _, { user: currentUser }) => {
  if (!currentUser) return null;
  const currentCollMember = await prisma.roundMember.findUnique({
    where: {
      userId_roundId: {
        userId: currentUser.id,
        roundId: member.roundId,
      },
    },
  });

  if (!(currentCollMember?.isAdmin || currentCollMember?.id == member.id))
    return null;

  // Use pre-included user if available
  if (member.user && typeof member.user === "object") {
    return member.user.name;
  }

  const u = await prisma.user.findFirst({
    where: {
      collMemberships: {
        some: { id: member.id },
      },
    },
  });
  return u?.name;
};
