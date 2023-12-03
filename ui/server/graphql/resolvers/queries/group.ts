import prisma from "../../../prisma";
import { combineResolvers } from "graphql-resolvers";
import { isGroupAdmin, isRootAdmin } from "../auth";
import { sign } from "server/utils/jwt";
import { appLink } from "utils/internalLinks";
import { getGroup } from "server/controller";
import discourse from "../../../lib/discourse";
import { canViewGroup, getRoundMemberBalance } from "../helpers";

export const group = async (parent, { groupSlug }, { user, ss }) => {
  if (!groupSlug) return null;
  if (process.env.SINGLE_GROUP_MODE !== "true" && groupSlug == "c") return null;

  const group = await getGroup({ groupSlug, user, ss });

  if (ss || (await canViewGroup({ group, user }))) {
    return group;
  }

  return null;
};

export const groups = combineResolvers(isRootAdmin, async (parent, args) => {
  return prisma.group.findMany();
});

export const adminGroups = async (_1, _2, { user }) => {
  const groupMemberships = await prisma.groupMember.findMany({
    where: { userId: user?.id, isAdmin: true },
  });
  const groupIds = groupMemberships.map((membership) => membership.groupId);
  return prisma.group.findMany({ where: { id: { in: groupIds } } });
};

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

export const balances = async (parent, { groupSlug }, { user }) => {
  try {
    const group = await prisma.group.findFirst({
      where: {
        slug: groupSlug,
      },
    });
    if (group) {
      const rounds = await prisma.round.findMany({
        where: {
          groupId: group.id,
        },
      });
      const roundIds = rounds.map((r) => r.id);

      if (roundIds.length === 0) {
        return [];
      }

      const memberships = await prisma.roundMember.findMany({
        where: {
          userId: user?.id,
          roundId: { in: roundIds },
        },
      });

      const balancePromises = memberships.map((m) => getRoundMemberBalance(m));
      const balances = await Promise.all(balancePromises);

      return balances.map(({ balance, roundId }, i) => ({
        balance,
        roundId,
      }));
    } else {
      return {
        error: "Group not found",
      };
    }
  } catch (err) {
    return [];
  }
};
