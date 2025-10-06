import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { combineResolvers } from "graphql-resolvers";
import { getGroup } from "server/controller";
import { getOCToken } from "server/utils/roundUtils";
import { appLink } from "utils/internalLinks";
import { TOKEN_STATUS } from "../../../../constants";
import prisma from "../../../prisma";
import { sign } from "../../../utils/jwt";
import {
  bucketTotalContributions,
  getCollective,
  getProject,
  getRoundFundingStatuses,
  isCollAdmin,
  isCollOrGroupAdmin,
  isGrantingOpen,
  statusTypeToQuery,
  stripeIsConnected as stripeIsConnectedHelper,
} from "../helpers";
import isGroupSubscriptionActive from "../helpers/isGroupSubscriptionActive";

export const color = (round) => round.color ?? "anthracit";
export const info = (round) => {
  return round.info && round.info.length
    ? round.info
    : `# Welcome to ${round.title}`;
};
export const about = (round) => {
  return round.about && round.about.length
    ? round.about
    : `# About ${round.title}`;
};
export const numberOfApprovedMembers = async (round) => {
  return prisma.roundMember.count({
    where: { roundId: round.id, isApproved: true },
  });
};
export const totalAllocations = async (round) => {
  // const {
  //   _sum: { amount: transactionAmount },
  // } = await prisma.transaction.aggregate({
  //   where: {
  //     toAccount: {
  //       collectionMemberStatus: { collectionId: collection.id },
  //     },
  //   },
  //   _sum: { amount: true },
  // });

  const {
    _sum: { amount },
  } = await prisma.allocation.aggregate({
    where: { roundId: round.id },
    _sum: { amount: true },
  });

  // // if (transactionAmount !== amount) {
  // //   console.error("total allocation amounts don't add up properly...");
  // //   console.log({ transactionAmount, allocationAmount: amount });
  // // }
  // console.log({ transactionAmount, allocationAmount: amount });

  return amount;
};
export const totalContributions = async (round) => {
  const {
    _sum: { amount },
  } = await prisma.contribution.aggregate({
    where: { roundId: round.id },
    _sum: { amount: true },
  });

  return amount;
};
export const totalContributionsFunding = async (round) => {
  const fundingBuckets = await prisma.bucket.findMany({
    where: { roundId: round.id, fundedAt: null },
    select: { id: true },
  });
  const fundingBucketIds = fundingBuckets.map((bucket) => bucket.id);

  const {
    _sum: { amount: totalContributionsFunded },
  } = await prisma.contribution.aggregate({
    _sum: { amount: true },
    where: {
      roundId: round.id,
      bucketId: { in: fundingBucketIds },
    },
  });

  return totalContributionsFunded;
};
export const totalContributionsFunded = async (round) => {
  const fundedBuckets = await prisma.bucket.findMany({
    where: { roundId: round.id, fundedAt: { not: null } },
    select: { id: true },
  });
  const fundedBucketIds = fundedBuckets.map((bucket) => bucket.id);

  const {
    _sum: { amount: totalContributionsFunded },
  } = await prisma.contribution.aggregate({
    _sum: { amount: true },
    where: {
      roundId: round.id,
      bucketId: { in: fundedBucketIds },
    },
  });

  return totalContributionsFunded;
};
export const totalInMembersBalances = async (round) => {
  // console.time("creditMinusDebit");

  // const {
  //   _sum: { amount: totalCredit },
  // } = await prisma.transaction.aggregate({
  //   where: {
  //     roundId: round.id,
  //     type: "ALLOCATION",
  //   },
  //   _sum: { amount: true },
  // });

  // const {
  //   _sum: { amount: totalDebit },
  // } = await prisma.transaction.aggregate({
  //   where: {
  //     roundId: round.id,
  //     type: "CONTRIBUTION",
  //   },
  //   _sum: { amount: true },
  // });
  // console.timeEnd("creditMinusDebit");

  // const balance = totalCredit - totalDebit;

  // console.time("allocationsMinusContributions");

  const {
    _sum: { amount: totalAllocations },
  } = await prisma.allocation.aggregate({
    where: { roundId: round.id },
    _sum: { amount: true },
  });

  const {
    _sum: { amount: totalContributions },
  } = await prisma.contribution.aggregate({
    where: { roundId: round.id },
    _sum: { amount: true },
  });

  // const allocationsMinusContibutions =
  //   totalAllocations - totalContributions;

  //console.timeEnd("allocationsMinusContributions");

  // if (balance !== allocationsMinusContibutions) {
  //   console.error("Total in members balances not adding up");
  // }

  return totalAllocations - totalContributions;
};
export const tags = async (round) => {
  return prisma.tag.findMany({ where: { roundId: round.id } });
};
export const guidelines = async (round) =>
  prisma.guideline.findMany({ where: { roundId: round.id } });
export const customFields = async (round) =>
  prisma.field.findMany({ where: { roundId: round.id } });
export const grantingIsOpen = (round) => {
  return isGrantingOpen(round);
};
export const grantingHasClosed = (round) => {
  return round.grantingCloses
    ? dayjs(round.grantingCloses).isBefore(dayjs())
    : false;
};
export const bucketCreationIsOpen = (round) => {
  if (!round.bucketCreationCloses) return true;

  const now = dayjs();
  const bucketCreationCloses = dayjs(round.bucketCreationCloses);

  return now.isBefore(bucketCreationCloses);
};

export const stripeIsConnected = combineResolvers(
  isCollOrGroupAdmin,
  (round) => {
    return stripeIsConnectedHelper({ round });
  }
);

export const group = async (round, _, { user, ss }) => {
  if (round.singleRound) return null;
  return getGroup({ groupId: round.groupId, user, ss });
};

export const bucketStatusCount = async (round, _, { user }) => {
  const currentMember = await prisma.roundMember.findFirst({
    where: {
      userId: user?.id ?? "undefined",
      roundId: round.id,
    },
  });

  const isAdminOrGuide =
    currentMember && (currentMember.isAdmin || currentMember.isModerator);

  const fundingStatus = await getRoundFundingStatuses({ roundId: round.id });

  return {
    PENDING_APPROVAL: await prisma.bucket.count({
      where: {
        roundId: round.id,
        ...statusTypeToQuery("PENDING_APPROVAL", fundingStatus),
        ...(!isAdminOrGuide &&
          (currentMember
            ? {
                OR: [
                  { publishedAt: { not: null } },
                  { cocreators: { some: { id: currentMember.id } } },
                ],
              }
            : { publishedAt: { not: null } })),
      },
    }),
    OPEN_FOR_FUNDING: await prisma.bucket.count({
      where: {
        roundId: round.id,
        ...statusTypeToQuery("OPEN_FOR_FUNDING", fundingStatus),
        ...(!isAdminOrGuide &&
          (currentMember
            ? {
                OR: [
                  { publishedAt: { not: null } },
                  { cocreators: { some: { id: currentMember.id } } },
                ],
              }
            : { publishedAt: { not: null } })),
      },
    }),
    FUNDED: await prisma.bucket.count({
      where: {
        roundId: round.id,
        ...statusTypeToQuery("FUNDED", fundingStatus),
        ...(!isAdminOrGuide &&
          (currentMember
            ? {
                OR: [
                  { publishedAt: { not: null } },
                  { cocreators: { some: { id: currentMember.id } } },
                ],
                AND: { approvedAt: { not: null } },
              }
            : { publishedAt: { not: null } })),
      },
    }),
    CANCELED: await prisma.bucket.count({
      where: {
        roundId: round.id,
        ...statusTypeToQuery("CANCELED", fundingStatus),
        ...(!isAdminOrGuide &&
          (currentMember
            ? {
                OR: [
                  { publishedAt: { not: null } },
                  { cocreators: { some: { id: currentMember.id } } },
                ],
              }
            : { publishedAt: { not: null } })),
      },
    }),
    IDEA: await prisma.bucket.count({
      where: {
        roundId: round.id,
        ...statusTypeToQuery("IDEA", fundingStatus),
        ...(!isAdminOrGuide &&
          (currentMember
            ? {
                OR: [
                  { publishedAt: { not: null } },
                  { cocreators: { some: { id: currentMember.id } } },
                ],
              }
            : { publishedAt: { not: null } })),
      },
    }),
    COMPLETED: await prisma.bucket.count({
      where: {
        roundId: round.id,
        ...statusTypeToQuery("COMPLETED", fundingStatus),
        ...(!isAdminOrGuide &&
          (currentMember
            ? {
                OR: [
                  { publishedAt: { not: null } },
                  { cocreators: { some: { id: currentMember.id } } },
                ],
              }
            : { publishedAt: { not: null } })),
      },
    }),
  };
};

export const distributedAmount = async (round) => {
  const buckets = await prisma.bucket.findMany({
    where: { roundId: round.id },
  });
  if (buckets.length === 0) return 0;
  const totalContributionsPromises = buckets.map((bucket) =>
    bucketTotalContributions(bucket)
  );
  const totalContributions = await Promise.all(totalContributionsPromises);

  return totalContributions.reduce((total, current) => total + current, 0);
};

// todo: publishedBucketCount should be added to bucketStatusCount
export const publishedBucketCount = async (round) => {
  const buckets = await prisma.bucket.findMany({
    where: {
      roundId: round.id,
      NOT: {
        publishedAt: null,
      },
    },
  });
  return buckets.length;
};

export const ocCollective = async (parent) => {
  if (parent.openCollectiveProjectId) {
    return getProject(
      { id: parent.openCollectiveProjectId },
      getOCToken(parent)
    );
  } else if (parent.openCollectiveId) {
    return getCollective({ id: parent.openCollectiveId }, getOCToken(parent));
  }
};

export const ocWebhookUrl = async (parent, _, { ss, user }) => {
  const isAdmin = await isCollAdmin({
    roundId: parent.id,
    ss,
    userId: user?.id,
  });
  if (parent.openCollectiveId && isAdmin) {
    const token = sign({ rid: parent.id });
    return appLink(`/api/oc-hooks/${token}`);
  }
  return null;
};

export const expenses = async (parent) => {
  try {
    return prisma.expense.findMany({
      where: { roundId: parent.id },
      include: {
        receipts: {
          select: {
            amount: true,
          },
        },
      },
    });
  } catch (err) {
    return [];
  }
};

export const ocTokenStatus = async (parent) => {
  if (parent.ocToken) {
    return TOKEN_STATUS.PROVIDED;
  } else return TOKEN_STATUS.EMPTY;
};

export const membersLimit = async (round) => {
  const group = await prisma.group.findFirst({ where: { id: round.groupId } });

  let isSubscribed = false;
  try {
    await isGroupSubscriptionActive({
      group,
    });
    isSubscribed = group?.slug !== "c"; // isGroupSubscriptionActive passes OK for root group (default, unpaid)
  } catch (err) {
    ("");
  }

  const roundLimit = isSubscribed
    ? Math.max(
        round.maxMembers || 0,
        parseInt(process.env.PAID_ROUND_MEMBERS_LIMIT)
      )
    : round.maxMembers || 0;
  const limit =
    roundLimit ||
    (group?.slug !== "c"
      ? process.env.PAID_ROUND_MEMBERS_LIMIT
      : process.env.FREE_ROUND_MEMBERS_LIMIT);
  const currentCount = await prisma.roundMember.count({
    where: { roundId: round.id },
  });
  return {
    limit,
    currentCount,
    consumedPercentage: parseInt((currentCount / limit) * 100 + ""),
  };
};

export const bucketsLimit = async (round) => {
  const group = await prisma.group.findUnique({ where: { id: round.groupId } });
  const status = group.slug === "c" ? "free" : "paid";

  const fundingStatus = await getRoundFundingStatuses({ roundId: round.id });
  const statusFilter = ["FUNDED", "COMPLETED"]
    .map((s) => statusTypeToQuery(s, fundingStatus))
    .filter((s) => s);

  const currentCount = await prisma.bucket.count({
    where: {
      roundId: round.id,
      OR: statusFilter as Array<Prisma.BucketWhereInput>,
    },
  });

  const limit = Math.max(
    parseInt(
      status === "free"
        ? process.env.MAX_FREE_BUCKETS
        : process.env.MAX_PAID_BUCKETS
    ),
    round.maxFreeBuckets
  );

  const consumedPercentage = Math.round((currentCount / limit) * 100);
  const isLimitOver = currentCount >= limit;

  return {
    currentCount,
    limit,
    consumedPercentage,
    isLimitOver,
    status,
  };
};
