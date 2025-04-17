import prisma from "../../../prisma";
import { combineResolvers } from "graphql-resolvers";
import { isCollMember, isCollMemberOrGroupAdmin } from "../auth";
import { sign } from "server/utils/jwt";
import { appLink } from "utils/internalLinks";
import {
  canViewRound,
  getCollectiveOrProject,
  getExpensesCount,
  isAndGetCollMemberOrGroupAdmin,
  isCollAdmin,
} from "../helpers";
import { RoundTransaction } from "server/types";
import cache from "memory-cache";
import {
  CURRENCY_CACHE,
  GRAPHQL_ADMIN_ONLY,
  GRAPHQL_COLLECTIVE_NOT_VERIFIED,
  GRAPHQL_OC_NOT_INTEGRATED,
} from "../../../../constants";
import { getExchangeRates } from "../helpers/getExchangeRate";
import { getOCToken } from "server/utils/roundUtils";

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

  let rounds: any[];

  // if admin show all rounds (current or archived)
  if (currentGroupMember?.isAdmin) {
    rounds = await prisma.round.findMany({
      where: { group: { slug: groupSlug }, deleted: { not: true } },
      take: limit,
    });
  } else {
    const allRounds = await prisma.round.findMany({
      where: {
        group: { slug: groupSlug },
        archived: { not: true },
        deleted: { not: true },
      },
      take: limit,
    });

    // filter away colls the current user shouldn't be able to view
    rounds = (
      await Promise.all(
        allRounds.map(async (r) =>
          (await canViewRound({ round: r, user })) ? r : undefined
        )
      )
    ).filter(Boolean);
  }

  if (!rounds.length) return [];

  const roundIds = rounds.map((r) => r.id);

  /* --- bucket counters (PUBLISHED & FUNDED) --------------------------- */
  const bucketAgg = await prisma.bucket.groupBy({
    by: ["roundId", "status"],
    where: { roundId: { in: roundIds } },
    _count: { _all: true },
  });
  const bucketMap: Record<string, Record<string, number>> = {};
  bucketAgg.forEach((b) => {
    bucketMap[b.roundId] = bucketMap[b.roundId] || {};
    bucketMap[b.roundId][b.status] = b._count._all;
  });

  /* --- distributedAmount --------------------------------------------- */
  const amountAgg = await prisma.expense.groupBy({
    by: ["roundId"],
    where: { bucket: { roundId: { in: roundIds } } },
    _sum: { amount: true },
  });
  const amountMap = Object.fromEntries(
    amountAgg.map((a) => [a.roundId, a._sum.amount ?? 0]),
  );

  /* --- attach the aggregates and return ------------------------------ */
  return rounds.map((r) => ({
    ...r,
    publishedBucketCount: bucketMap[r.id]?.PUBLISHED ?? 0,
    bucketStatusCount: { FUNDED: bucketMap[r.id]?.FUNDED ?? 0 },
    distributedAmount: amountMap[r.id] ?? 0,
  }));
};

export const round = async (parent, { groupSlug, roundSlug }, { user, ss }) => {
  if (!roundSlug) return null;

  const _round = await prisma.round.findFirst({
    where: {
      slug: roundSlug,
      group: { slug: groupSlug ?? "c" },
      deleted: { not: true },
    },
  });
  if (!_round) return null;

  if ((await canViewRound({ round: _round, user })) || ss) {
    return _round;
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
      ss,
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
            "deleted",
            "collectionMemberId" as "roundMemberId", 
            null as "allocatedById", 
            "amount",
            "bucketId",
            "amountBefore", 
            null as "allocationType",
            'CONTRIBUTION' as "transactionType",
            "createdAt"
          FROM "Contribution" where ("deleted" IS NULL OR "deleted" = false) AND "collectionId" = ${roundId}
          
          UNION ALL
          
          SELECT 
            "id", 
            "deleted",
            "collectionMemberId" as "roundMemberId", 
            "allocatedById",
            "amount",
            null as "bucketId",
            "amountBefore", 
            "allocationType",
            'ALLOCATION' as "transactionType",
            "createdAt"
          FROM "Allocation" where ("deleted" IS NULL OR "deleted" = false) AND "collectionId" = ${roundId}
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
      ss,
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

export const convertCurrency = async (_, { amounts, toCurrency }) => {
  let sum = 0;
  let currencies = cache.get(CURRENCY_CACHE);
  if (!currencies) {
    const data = await fetch(
      `https://api.getgeoapi.com/v2/currency/convert?api_key=${process.env.CURRENCY_API_KEY}&from=USD`
    );
    currencies = await data.json();
    cache.put(CURRENCY_CACHE, null, 60 * 60 * 1000); //invalidate cache after 1 hour
  }
  amounts.forEach((amount) => {
    const valueInBase =
      amount.amount / (currencies.rates[amount.currency]?.rate || 1);
    sum += (currencies.rates[toCurrency]?.rate || 1) * valueInBase;
  });

  return sum;
};

export const adminRounds = async (_1, _2, { user }) => {
  const roundMemberships = await prisma.roundMember.findMany({
    where: {
      userId: user?.id,
      OR: [{ isAdmin: true }, { isModerator: true }],
    },
  });
  const defaultGroup = await prisma.group.findUnique({ where: { slug: "c" } });
  const roundIds = roundMemberships.map((membership) => membership.roundId);
  return prisma.round.findMany({
    where: {
      groupId: defaultGroup?.id,
      id: { in: roundIds },
    },
  });
};

export const exchangeRates = async (_, { currencies }) => {
  const rates = (await getExchangeRates()).rates || {};
  const response = [];
  currencies.forEach((currency) => {
    response.push({
      currency,
      rate: rates[currency]?.rate,
    });
  });
  return response;
};

export const expensesCount = async (_, { roundId }, { user }) => {
  const roundMember = await prisma.roundMember.findUnique({
    where: {
      userId_roundId: {
        userId: user.id,
        roundId,
      },
    },
    include: {
      round: {
        select: {
          openCollectiveId: true,
          openCollectiveProjectId: true,
          ocVerified: true,
          ocToken: true,
          currency: true,
        },
      },
    },
  });

  const isAdmin = roundMember.isAdmin;
  const round = roundMember.round;

  if (!isAdmin) {
    throw new Error(GRAPHQL_ADMIN_ONLY);
  }

  if (!round.openCollectiveId) {
    throw new Error(GRAPHQL_OC_NOT_INTEGRATED);
  }

  if (!round.ocVerified) {
    throw new Error(GRAPHQL_COLLECTIVE_NOT_VERIFIED);
  }

  const collective = await getCollectiveOrProject(
    { id: round.openCollectiveProjectId || round.openCollectiveId },
    round.openCollectiveProjectId,
    getOCToken(round)
  );

  return getExpensesCount(collective.slug, getOCToken(round));
};
