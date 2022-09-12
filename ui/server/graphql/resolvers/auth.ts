import prisma from "../../prisma";
import { skip } from "graphql-resolvers";
import { getGroupMember, getRoundMember } from "./helpers";

export const isGroupAdmin = async (parent, { groupId }, { user, ss }) => {
  if (ss) return skip;
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

export const isCollMember = async (parent, { roundId, bucketId }, { user, ss }) => {
  if (!user) throw new Error("You need to be logged in");
  if (ss) return skip;
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
  { user, ss }
) => {
  if (!user) throw new Error("You need to be logged in");
  if (ss) return skip;

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

export const isBucketCocreatorOrCollAdminOrMod = async (
  parent,
  { bucketId },
  { user, ss }
) => {
  if (!user) throw new Error("You need to be logged in");
  if (!bucketId) throw new Error("You need to provide bucketId");
  if (ss) return skip;

  const bucket = await prisma.bucket.findUnique({
    where: { id: bucketId },
    include: { cocreators: true, round: true },
  });

  const roundMember = await prisma.roundMember.findUnique({
    where: {
      userId_roundId: {
        userId: user.id,
        roundId: bucket.roundId,
      },
    },
  });

  if (
    !roundMember ||
    (!bucket.cocreators.map((m) => m.id).includes(roundMember.id) &&
      !roundMember.isAdmin &&
      !roundMember.isModerator)
  )
    throw new Error("You are not a cocreator of this bucket.");

  return skip;
};

export const isCollModOrAdmin = async (
  parent,
  { bucketId, roundId },
  { user, ss }
) => {
  if (!user) throw new Error("You need to be logged in");
  if (ss) return skip;
  const roundMember = await getRoundMember({
    userId: user.id,
    bucketId,
    roundId,
  });

  if (!(roundMember?.isModerator || roundMember?.isAdmin))
    throw new Error("You need to be admin or moderator of the round");
  return skip;
};

export const isSuperAdmin = (user) => {
  return !!user;
}