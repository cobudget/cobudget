import prisma from "server/prisma";

export const moveRoundToGroup = async ({ roundId, groupId }) => {
  // Round validations
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    select: {
      group: true,
    },
  });
  if (!round) {
    throw new Error("Round not found");
  }
  if (round.group?.slug !== "c") {
    throw new Error("Round already have a group");
  }

  // Group validations
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    throw new Error("Group not found");
  }

  // change group
  const updatedRound = await prisma.round.update({
    where: { id: roundId },
    data: {
      groupId: group?.id,
      singleRound: false,
    },
  });

  // move round members
  const roundMembers = await prisma.roundMember.findMany({
    where: { roundId },
  });

  const alreadyGroupMembers = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });
  const alreadyGroupMemberIds = alreadyGroupMembers.map(
    (member) => member.userId
  );

  await prisma.groupMember.createMany({
    data: roundMembers
      .filter((member) => alreadyGroupMemberIds.indexOf(member.userId) === -1)
      .map((member) => ({
        userId: member.userId,
        groupId: group.id,
      })),
  });

  return updatedRound;
};
