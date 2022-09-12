import prisma from "../../../prisma";
import { combineResolvers } from "graphql-resolvers";
import { isCollMember, isCollMemberOrGroupAdmin } from "../auth";
import { sign } from "server/utils/jwt";
import { appLink } from "utils/internalLinks";
import {
  canViewRound,
  isAndGetCollMemberOrGroupAdmin,
  isCollAdmin,
} from "../helpers";
import { RoundTransaction } from "server/types";

export const rounds = async (parent, { limit, groupSlug }, { user }) => {
  if (!groupSlug) return null;

  const currentGroupMember = user
    ? await prisma.groupMember.findFirst({
        where: {
          group: { slug: groupSlug },
          userId: user.id,
        },
      })
    : null;

  // if admin show all rounds (current or archived)
  if (currentGroupMember?.isAdmin) {
    return prisma.round.findMany({
      where: { group: { slug: groupSlug }, deleted: { not: true } },
      take: limit,
    });
  }

  const allRounds = await prisma.round.findMany({
    where: {
      group: { slug: groupSlug },
      archived: { not: true },
      deleted: { not: true },
    },
    take: limit,
  });

  // filter away colls the current user shouldn't be able to view
  return (
    await Promise.all(
      allRounds.map(async (coll) =>
        (await canViewRound({ round: coll, user })) ? coll : undefined
      )
    )
  ).filter(Boolean);
};

export const round = async (parent, { groupSlug, roundSlug }, { user }) => {
  if (!roundSlug) return null;

  const round = await prisma.round.findFirst({
    where: {
      slug: roundSlug,
      group: { slug: groupSlug ?? "c" },
      deleted: { not: true },
    },
  });
  if (!round) return null;

  if (await canViewRound({ round: round, user })) {
    return round;
  } else {
    return null;
  }
};

export const invitationLink = async (parent, { roundId }, { user, ss }) => {
  const isAdmin =
    !!user &&
    isCollAdmin({
      userId: user.id,
      roundId,
      ss
    });

  if (!isAdmin) {
    throw new Error("You need to be admin to fetch invitation link");
  }

  const round = await prisma.round.findFirst({
    where: {
      id: roundId,
    },
  });
  return {
    link:
      round.inviteNonce !== null
        ? appLink("/invite/" + sign({ nonce: round.inviteNonce, roundId }))
        : null,
  };
};

export const contributionsPage = combineResolvers(
  isAndGetCollMemberOrGroupAdmin,
  async (parent, { roundId, offset, limit }) => {
    // const contributionsWithExtra = [
    //   ...(await Contribution.find({ roundId }, null, {
    //     skip: offset,
    //     limit: limit + 1,
    //   }).sort({
    //     createdAt: -1,
    //   })),
    // ];

    const contributionsWithExtra = await prisma.contribution.findMany({
      where: { roundId },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      moreExist: contributionsWithExtra.length > limit,
      contributions: contributionsWithExtra.slice(0, limit),
    };
  }
);

export const roundTransactions = combineResolvers(
  isCollMember,
  async (parent, { roundId, offset, limit }) => {
    const transactions: [RoundTransaction] = await prisma.$queryRaw`
        (
          SELECT 
            "id", 
            "collectionMemberId" as "roundMemberId", 
            null as "allocatedById", 
            "amount",
            "bucketId",
            "amountBefore", 
            null as "allocationType",
            'CONTRIBUTION' as "transactionType",
            "createdAt"
          FROM "Contribution" where "collectionId" = ${roundId}
          
          UNION ALL
          
          SELECT 
            "id", 
            "collectionMemberId" as "roundMemberId", 
            "allocatedById", 
            "amount",
            null as "bucketId",
            "amountBefore", 
            "allocationType",
            'ALLOCATION' as "transactionType",
            "createdAt"
          FROM "Allocation" where "collectionId" = ${roundId}
        ) ORDER BY "createdAt" DESC LIMIT ${limit} OFFSET ${offset};
      `;

    transactions.forEach(
      (transaction) => (transaction.createdAt = new Date(transaction.createdAt))
    );

    return {
      moreExist: transactions.length > limit,
      transactions: transactions.slice(0, limit),
    };
  }
);

export const members = combineResolvers(
  isCollMemberOrGroupAdmin,
  async (parent, { roundId, isApproved }) => {
    return await prisma.roundMember.findMany({
      where: {
        roundId,
        isApproved,
        ...(!isApproved && { isRemoved: false }),
      },
    });
  }
);

export const membersPage = combineResolvers(
  isCollMemberOrGroupAdmin,
  async (
    parent,
    { roundId, isApproved, search, offset = 0, limit = 10 },
    { user, ss }
  ) => {
    const isAdmin = await isCollAdmin({
      userId: user.id,
      roundId,
      ss
    });
    if (!isAdmin && !isApproved) return null;

    const insensitiveSearch: { contains: string; mode: "insensitive" } = {
      contains: search,
      mode: "insensitive",
    };

    const roundMembersWithExtra = await prisma.roundMember.findMany({
      where: {
        roundId,
        isApproved,
        ...(!isApproved && { isRemoved: false }),
        ...(search && {
          user: {
            OR: [
              { username: insensitiveSearch },
              { name: insensitiveSearch },
              ...(isAdmin ? [{ email: insensitiveSearch }] : []),
            ],
          },
        }),
        ...(!isAdmin && { hasJoined: true }),
      },
      take: limit + 1,
      skip: offset,
      ...(search && { include: { user: true } }),
    });

    return {
      moreExist: roundMembersWithExtra.length > limit,
      members: roundMembersWithExtra.slice(0, limit),
    };
  }
);
