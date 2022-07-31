import prisma from "../../prisma";
import { skip } from "graphql-resolvers";

export const isGroupAdmin = async (parent, { groupId }, { user }) => {
    if (!user) throw new Error("You need to be logged in");
    const groupMember = await prisma.groupMember.findUnique({
        where: {
            groupId_userId: { groupId: groupId, userId: user.id },
        },
    });
    if (!groupMember?.isAdmin) throw new Error("You need to be group admin");
    return skip;
};