import prisma from "../../../prisma";

export const getSuperAdminSession = async (parent, args, { ss }) => {
    try {
    if (!ss) {
        return null;
    }
    const session = await prisma.superAdminSession.findFirst({ where: { id: ss.id } });
    return session;
    }
    catch (err) {
        console.log("ERROR", err);
    }
}