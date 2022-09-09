import prisma from "../../../prisma";

export const guideline = async (flag) => {
  if (!flag.guidelineId) return null;
  return prisma.guideline.findUnique({ where: { id: flag.guidelineId } });
};
export const user = async () => {
  // see who left a flag
  // if not group admin or round admin or guide
  return null;
};
