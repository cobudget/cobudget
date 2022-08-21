import prisma from "../../prisma";
import { skip } from "graphql-resolvers";
import { getGroupMember, getRoundMember } from "./helpers";

export const isGroupAdmin = async (parent, { groupId }, { user }) => {
  if (!user) throw new Error("You need to be logged in");
  const groupMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: { groupId: groupId, userId: user.id },
    },
  });
  if (!groupMember?.isAdmin) throw new Error("You need to be group admin");
  return skip;
};

export const isRootAdmin = (parent, args, { user }) => {
  // TODO: this is old code that doesn't really work right now
  return user && user.isRootAdmin
    ? skip
    : new Error("You need to be root admin");
};

export const isCollMember = async (parent, { roundId, bucketId }, { user }) => {
  if (!user) throw new Error("You need to be logged in");

  const roundMember = await getRoundMember({
    userId: user.id,
    roundId,
    bucketId,
  });
  // const roundMember = await prisma.roundMember.findUnique({
  //   where: { userId_roundId: { userId: user.id, roundId } },
  // });
  if (!roundMember) {
    throw new Error("Round member does not exist");
  } else if (!roundMember.isApproved) {
    throw new Error("Round member is not approved");
  } else if (!roundMember.hasJoined) {
    throw new Error("Round member has not accepted the invitation");
  }

  return skip;
};

export const isCollMemberOrGroupAdmin = async (
  parent,
  { roundId },
  { user }
) => {
  if (!user) throw new Error("You need to be logged in");

  const roundMember = await getRoundMember({
    userId: user.id,
    roundId,
  });

  let groupMember = null;
  if (!roundMember) {
    const group = await prisma.group.findFirst({
      where: { rounds: { some: { id: roundId } } },
    });
    groupMember = await getGroupMember({
      userId: user.id,
      groupId: group.id,
    });
  }

  if (!(roundMember?.isApproved || groupMember?.isAdmin))
    throw new Error(
      "You need to be an approved participant in this round or a group admin to view round participants"
    );
  return skip;
};
