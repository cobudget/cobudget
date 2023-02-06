import prisma from "../../../prisma";
import { roundMemberBalance } from "../helpers";

export const round = async (member) => {
  return await prisma.round.findUnique({
    where: { id: member.roundId },
  });
};

export const user = async (member) =>
  prisma.user.findUnique({
    where: { id: member.userId },
  });

export const balance = async (member) => {
  return roundMemberBalance(member);
};

export const email = async (member, _, { user, ss }) => {
  if (!user) return null;
  const currentCollMember = await prisma.roundMember.findUnique({
    where: {
      userId_roundId: {
        userId: user.id,
        roundId: member.roundId,
      },
    },
  });

  if (!(ss || currentCollMember?.isAdmin || currentCollMember?.id == member.id))
    return null;

  const u = await prisma.user.findFirst({
    where: {
      collMemberships: {
        some: { id: member.id },
      },
    },
  });
  return u.email;
};

export const name = async (member, _, { user }) => {
  if (!user) return null;
  const currentCollMember = await prisma.roundMember.findUnique({
    where: {
      userId_roundId: {
        userId: user.id,
        roundId: member.roundId,
      },
    },
  });

  if (!(currentCollMember?.isAdmin || currentCollMember.id == member.id))
    return null;

  const u = await prisma.user.findFirst({
    where: {
      collMemberships: {
        some: { id: member.id },
      },
    },
  });
  return u.name;
};
