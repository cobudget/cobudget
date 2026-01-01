import prisma from "../../../prisma";

// Requires active super admin session (ss context)
export const updateInstanceSettings = async (
  parent,
  { landingGroupId },
  { ss }
) => {
  if (!ss) {
    throw new Error("Super admin session required");
  }

  try {
    return await prisma.instanceSettings.upsert({
      where: { id: "singleton" },
      update: { landingGroupId },
      create: { id: "singleton", landingGroupId },
      include: { landingGroup: true },
    });
  } catch (error) {
    console.error("Failed to update instance settings:", error);
    throw error;
  }
};
