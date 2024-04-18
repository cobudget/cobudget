import prisma from "../../../prisma";

export const currentGroupMember = async (parent, { groupSlug }, { user }) => {
  if (user?.id !== parent.id) return null;
  if (!groupSlug) return null;
  if (process.env.SINGLE_GROUP_MODE !== "true" && groupSlug == "c") return null;

  return prisma.groupMember.findFirst({
    where: { group: { slug: groupSlug }, userId: user.id },
  });
};
export const currentCollMember = async (
  parent,
  { groupSlug, roundSlug },
  { user }
) => {
  if (user?.id !== parent.id) return null;
  if (!roundSlug) return null;
  return prisma.roundMember.findFirst({
    where: {
      round: {
        slug: roundSlug,
        group: { slug: groupSlug },
      },
      userId: user.id,
    },
  });
};
export const groupMemberships = async (user) =>
  prisma.groupMember.findMany({ where: { userId: user.id } });
export const roundMemberships = async (user) =>
  prisma.roundMember.findMany({
    where: { userId: user.id, round: { isNot: { deleted: true } } },
  });
export const isRootAdmin = () => false; //TODO: add field in prisma
export const avatar = () => null; //TODO: add avatars
export const email = (parent, _, { user }) => {
  if (!user) return null;
  // if (parent.id !== user.id) return null;
  if (parent.email) return parent.email;
};
// name: async (parent, _, { user }) => {
//   if (!user) return null;
//   if (parent.id !== user.id) return null;
//   if (parent.name) return parent.name;
//   // we end up here when requesting your own name but it's missing on the parent
//   return (
//     await prisma.user.findUnique({
//       where: { id: parent.id },
//       select: { name: true },
//     })
//   ).name;
// },
export const username = async (parent) => {
  if (!parent.username && parent.id) {
    return (
      await prisma.user.findUnique({
        where: { id: parent.id },
        select: { username: true },
      })
    ).username;
  }
  return parent.username;
};
export const phoneNumber = async (parent) => {
  if (!parent.phoneNumber && parent.id) {
    return (
      await prisma.user.findUnique({
        where: { id: parent.id },
        select: { phoneNumber: true },
      })
    ).phoneNumber;
  }
  return parent.phoneNumber;
};
export const emailSettings = async (parent, args, { user }) => {
  if (user?.id !== parent.id) return null;

  return prisma.emailSettings.upsert({
    where: { userId: parent.id },
    create: { userId: parent.id },
    update: {},
  });
};
