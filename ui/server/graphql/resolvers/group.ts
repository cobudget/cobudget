import prisma from "../../prisma";
import { combineResolvers } from "graphql-resolvers";
import { isGroupAdmin } from "./auth";
import { sign } from "server/utils/jwt";
import { appLink } from "utils/internalLinks";

export const createGroupInvitationLink = combineResolvers(
  isGroupAdmin,
  async (_, { groupId }) => {
    const inviteNonce = Date.now();
    const round = await prisma.group.update({
      where: { id: groupId },
      data: { inviteNonce },
    });
    return {
      link: round.inviteNonce,
    };
  }
);

export const deleteGroupInvitationLink = combineResolvers(
  isGroupAdmin,
  async (_, { groupId }) => {
    await prisma.group.update({
      where: { id: groupId },
      data: { inviteNonce: null },
    });
    return {
      link: null,
    };
  }
);

export const groupInvitationLink = combineResolvers(
  isGroupAdmin,
  async (_, { groupId }) => {
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
      },
    });
    return {
      link:
        group.inviteNonce !== null
          ? appLink("/invite/" + sign({ nonce: group.inviteNonce, groupId }))
          : null,
    };
  }
);
