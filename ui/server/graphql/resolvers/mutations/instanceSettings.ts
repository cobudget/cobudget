import prisma from "../../../prisma";

// Requires active super admin session (ss context)
export const updateInstanceSettings = async (
  parent,
  { landingGroupId, allowOrganizationCreation },
  { ss }
) => {
  if (!ss) {
    throw new Error("Super admin session required");
  }

  try {
    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (landingGroupId !== undefined) {
      updateData.landingGroupId = landingGroupId;
    }
    if (allowOrganizationCreation !== undefined) {
      updateData.allowOrganizationCreation = allowOrganizationCreation;
    }

    return await prisma.instanceSettings.upsert({
      where: { id: "singleton" },
      update: updateData,
      create: {
        id: "singleton",
        landingGroupId,
        allowOrganizationCreation: allowOrganizationCreation ?? true,
      },
      include: { landingGroup: true },
    });
  } catch (error) {
    console.error("Failed to update instance settings:", error);
    throw error;
  }
};
