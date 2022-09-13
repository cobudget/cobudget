import prisma from "../../../prisma";

export const getSuperAdminSession = async (parent, args, { ss }) => {
  try {
    if (!ss) {
      return null;
    }
    const session = await prisma.superAdminSession.findFirst({
      where: { id: ss.id },
    });
    return session;
  } catch (err) {
    console.log("ERROR", err);
  }
};

export const getSuperAdminSessions = async (
  parent,
  { limit, offset },
  { ss }
) => {
  if (!ss) {
    throw new Error("Not allowed");
  }
  const sessions = await prisma.superAdminSession.findMany({
    take: limit + 1,
    skip: offset,
    orderBy: {
      start: "desc",
    },
  });

  return {
    moreExist: sessions.length > limit,
    sessions: sessions.slice(0, limit),
  };
};
