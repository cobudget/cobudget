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
  // Run both aggregates in parallel
  const [allocationsResult, contributionsResult] = await Promise.all([
    prisma.allocation.aggregate({
      where: { roundId: round.id },
      _sum: { amount: true },
    }),
    prisma.contribution.aggregate({
      where: { roundId: round.id },
      _sum: { amount: true },
    }),
  ]);

  const totalAllocations = allocationsResult._sum.amount || 0;
  const totalContributions = contributionsResult._sum.amount || 0;

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

export const stripeIsConfigured = () => {
  return !!process.env.STRIPE_API_KEY;
};

export const group = async (round, _, { user, ss }) => {
  if (round.singleRound) return null;
  return getGroup({ groupId: round.groupId, user, ss });
};

export const bucketStatusCount = async (round, _, { user }) => {
  // Fetch member and funding status in parallel
  const [currentMember, fundingStatus] = await Promise.all([
    prisma.roundMember.findFirst({
      where: {
        userId: user?.id ?? "undefined",
        roundId: round.id,
      },
    }),
    getRoundFundingStatuses({ roundId: round.id }),
  ]);

  const isAdminOrGuide =
    currentMember && (currentMember.isAdmin || currentMember.isModerator);

  // Helper to build visibility filter for non-admins
  const getVisibilityFilter = (requireApproved = false) => {
    if (isAdminOrGuide) return {};
    if (currentMember) {
      return {
        OR: [
          { publishedAt: { not: null } },
          { cocreators: { some: { id: currentMember.id } } },
        ],
        ...(requireApproved && { AND: { approvedAt: { not: null } } }),
      };
    }
    return { publishedAt: { not: null } };
  };

  // Run all 6 counts in parallel
  const [
    PENDING_APPROVAL,
    OPEN_FOR_FUNDING,
    FUNDED,
    CANCELED,
    IDEA,
    COMPLETED,
  ] = await Promise.all([
    prisma.bucket.count({
      where: {
        roundId: round.id,
        ...statusTypeToQuery("PENDING_APPROVAL", fundingStatus),
        ...getVisibilityFilter(),
      },
    }),
    prisma.bucket.count({
      where: {
        roundId: round.id,
        ...statusTypeToQuery("OPEN_FOR_FUNDING", fundingStatus),
        ...getVisibilityFilter(),
      },
    }),
    prisma.bucket.count({
      where: {
        roundId: round.id,
        ...statusTypeToQuery("FUNDED", fundingStatus),
        ...getVisibilityFilter(true),
      },
    }),
    prisma.bucket.count({
      where: {
        roundId: round.id,
        ...statusTypeToQuery("CANCELED", fundingStatus),
        ...getVisibilityFilter(),
      },
    }),
    prisma.bucket.count({
      where: {
        roundId: round.id,
        ...statusTypeToQuery("IDEA", fundingStatus),
        ...getVisibilityFilter(),
      },
    }),
    prisma.bucket.count({
      where: {
        roundId: round.id,
        ...statusTypeToQuery("COMPLETED", fundingStatus),
        ...getVisibilityFilter(),
      },
    }),
  ]);

  return {
    PENDING_APPROVAL,
    OPEN_FOR_FUNDING,
    FUNDED,
    CANCELED,
    IDEA,
    COMPLETED,
  };
};

export const distributedAmount = async (round) => {
  // Use a single aggregate query instead of fetching all buckets and their contributions
  const {
    _sum: { amount },
  } = await prisma.contribution.aggregate({
    where: { roundId: round.id },
    _sum: { amount: true },
  });

  return amount || 0;
};

// todo: publishedBucketCount should be added to bucketStatusCount
export const publishedBucketCount = async (round) => {
  return prisma.bucket.count({
    where: {
      roundId: round.id,
      publishedAt: { not: null },
      deleted: { not: true },
    },
  });
};

export const previewImages = async (round) => {
  // Fetch up to 5 images from published buckets in this round for preview
  const bucketsWithImages = await prisma.bucket.findMany({
    where: {
      roundId: round.id,
      deleted: { not: true },
      publishedAt: { not: null },
      canceledAt: null,
      Images: {
        some: {},
      },
    },
    include: {
      Images: {
        take: 1,
      },
    },
    take: 5,
    orderBy: {
      updatedAt: "desc",
    },
  });

  const images = bucketsWithImages
    .flatMap((bucket) =>
      bucket.Images.map((img) => ({
        id: img.id,
        small: img.small,
        large: img.large,
        bucketId: bucket.id,
      }))
    )
    .slice(0, 5);

  return images;
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
  // Run queries in parallel
  const [group, currentCount] = await Promise.all([
    prisma.group.findFirst({ where: { id: round.groupId } }),
    prisma.roundMember.count({ where: { roundId: round.id } }),
  ]);

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
  return {
    limit,
    currentCount,
    consumedPercentage: parseInt((currentCount / limit) * 100 + ""),
  };
};

export const bucketsLimit = async (round) => {
  // Run independent queries in parallel
  const [group, fundingStatus] = await Promise.all([
    prisma.group.findUnique({ where: { id: round.groupId } }),
    getRoundFundingStatuses({ roundId: round.id }),
  ]);
  const status = group.slug === "c" ? "free" : "paid";

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
