import prisma from "../../../prisma";

export const instanceSettings = async () => {
  // Get or create singleton
  let settings = await prisma.instanceSettings.findUnique({
    where: { id: "singleton" },
    include: { landingGroup: true },
  });

  if (!settings) {
    settings = await prisma.instanceSettings.create({
      data: { id: "singleton" },
      include: { landingGroup: true },
    });
  }

  return settings;
};
