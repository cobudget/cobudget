import prisma from "server/prisma";

export const getMeta = (email: string) => {
  return prisma.userMeta.findUnique({ where: { email } });
};

export const shouldSendMagicLink = async (email: string) => {
  const meta = await getMeta(email);
  //console.log("META", meta);
  if (meta && meta.lastMagicLinkDate) {
    console.log(
      "DIFF",
      Date.now() - new Date(meta.lastMagicLinkDate).getTime()
    );
    return (
      Date.now() - new Date(meta.lastMagicLinkDate).getTime() >
      parseInt(process.env.MAGIC_LINK_TIME_LIMIT) * 1000
    );
  }
  return true;
};
