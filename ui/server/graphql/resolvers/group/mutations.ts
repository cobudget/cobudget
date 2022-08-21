import prisma from "../../../prisma";
import { combineResolvers } from "graphql-resolvers";
import { isGroupAdmin, isRootAdmin } from "../auth";
import { sign } from "server/utils/jwt";
import { appLink } from "utils/internalLinks";
import { getGroup } from "server/controller";
import discourse from "../../../lib/discourse";

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
