import prisma from "../../../prisma";

export const currentUser = async (parent, args, { user }) => {
  return user ? await prisma.user.findUnique({ where: { id: user.id } }) : null;
};

export const user = async (parent, { userId }) => {
  // we let the resolvers grab any extra requested fields, so we don't accidentally leak e.g. emails
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
};
