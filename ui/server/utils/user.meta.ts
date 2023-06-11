import prisma from "server/prisma";

export const getMeta = (email: string) => {
  return prisma.userMeta.findUnique({ where: { email } });
};

export const shouldSendMagicLink = async (email: string) => {
  const meta = await getMeta(email);
  if (meta && meta.lastMagicLinkDate) {
    return (
      Date.now() - new Date(meta.lastMagicLinkDate).getTime() >
      parseInt(process.env.MAGIC_LINK_TIME_LIMIT) * 1000
    );
  }
  return true;
};

export const updateLastMagicLinkTime = async (email: string) => {
  const meta = await getMeta(email);
  if (meta) {
    return prisma.userMeta.update({
      where: { id: meta.id },
      data: {
        lastMagicLinkDate: new Date(),
      },
    });
  } else {
    return prisma.userMeta.create({
      data: {
        email,
        lastMagicLinkDate: new Date(),
      },
    });
  }
};
