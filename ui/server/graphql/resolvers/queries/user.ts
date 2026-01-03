import prisma from "../../../prisma";

export const currentUser = async (parent, args, { user }) => {
  if (!user) return null;

  // Pre-include commonly requested relations to avoid N+1 queries
  return prisma.user.findUnique({
    where: { id: user.id },
    include: {
      groupMemberships: {
        include: {
          group: true,
        },
      },
      collMemberships: {
        where: {
          round: {
            deleted: { not: true },
          },
        },
        include: {
          round: {
            include: {
              group: true,
            },
          },
        },
      },
    },
  });
};

export const user = async (parent, { userId }) => {
  // we let the resolvers grab any extra requested fields, so we don't accidentally leak e.g. emails
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
};
