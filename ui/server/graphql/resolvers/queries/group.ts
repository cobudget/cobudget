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

export const balances = async (_parent, { groupSlug }, { user }) => {
  // caller not logged‑in → nothing to compute
  if (!user?.id) return [];

  /* 1) get *all* roundIds of this user inside the group – ONE query */
  const memberships = await prisma.roundMember.findMany({
    where: {
      userId: user.id,
      round: { group: { slug: groupSlug } },
    },
    select: { roundId: true },
  });
  const roundIds = memberships.map((m) => m.roundId);
  if (roundIds.length === 0) return [];

  /* 2) aggregate the user's balance per round – ONE query */
  const aggregates = await prisma.transaction.groupBy({
    by: ["roundId"],
    where: {
      roundId: { in: roundIds },
      userId: user.id,
    },
    _sum: { amount: true },
  });

  /* 3) map result to GraphQL shape */
  return aggregates.map((a) => ({
    roundId: a.roundId,
    balance: a._sum?.amount ?? 0,
  }));
};
