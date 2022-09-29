import prisma from "../../../prisma";

export const user = (parent) => {
  return prisma.user.findFirst({ where: { id: parent.adminId } });
};
