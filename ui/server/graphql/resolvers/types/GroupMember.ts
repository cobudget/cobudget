import prisma from "../../../prisma";
export const hasDiscourseApiKey = (groupMember) =>
  !!groupMember.discourseApiKey;
export const user = async (groupMember) => {
  return await prisma.user.findUnique({
    where: { id: groupMember.userId },
  });
};
export const email = async (member, _, { user, ss }) => {
  if (!user) return null;
  const currentGroupMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: member.groupId,
        userId: user.id,
      },
    },
  });

  if (
    !(currentGroupMember?.isAdmin || currentGroupMember?.id == member.id) &&
    !ss
  )
    return null;

  const u = await prisma.user.findFirst({
    where: {
      groupMemberships: {
        some: { id: member.id },
      },
    },
  });
  return u.email;
};
export const name = async (member, _, { user, ss }) => {
  if (!user) return null;
  const currentGroupMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: member.groupId,
        userId: user.id,
      },
    },
  });

  if (
    !(currentGroupMember?.isAdmin || currentGroupMember?.id == member.id) &&
    !ss
  )
    return null;

  const u = await prisma.user.findFirst({
    where: {
      groupMemberships: {
        some: { id: member.id },
      },
    },
  });
  return u.name;
};
export const group = async (groupMember) =>
  prisma.group.findUnique({
    where: { id: groupMember.groupId },
  });
