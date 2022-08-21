import prisma from "../../../prisma";
import { combineResolvers } from "graphql-resolvers";
import { isGroupAdmin, isRootAdmin } from "../auth";
import { sign } from "server/utils/jwt";
import { appLink } from "utils/internalLinks";
import { getGroup } from "server/controller";
import discourse from "../../../lib/discourse";

export const group = async (parent, { groupSlug }, { user }) => {
  if (!groupSlug) return null;
  if (process.env.SINGLE_GROUP_MODE !== "true" && groupSlug == "c") return null;
  return getGroup({ groupSlug, user });
};

export const groups = combineResolvers(isRootAdmin, async (parent, args) => {
  return prisma.group.findMany();
});

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

export const groupMembersPage = combineResolvers(
  isGroupAdmin,
  async (
    parent,
    { offset = 0, limit, groupId, search, isApproved },
    { user }
  ) => {
    const groupMembersWithExtra = await prisma.groupMember.findMany({
      where: {
        groupId: groupId,
        isApproved,
        ...(search && {
          user: {
            OR: [
              { username: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        }),
      },
      skip: offset || 0,
      take: (limit || 1e3) + 1,
    });

    return {
      moreExist: groupMembersWithExtra.length > limit,
      groupMembers: groupMembersWithExtra.slice(0, limit),
    };
  }
);

export const categories = async (parent, { groupId }) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { discourse: true },
  });

  if (!group.discourse) {
    return [];
  }

  // TODO: permission check here?

  const categories = await discourse(group.discourse).categories.getAll();

  return categories;
};
