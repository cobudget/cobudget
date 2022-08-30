import prisma from "../../../prisma";
import dayjs from "dayjs";
import { getGroup } from "server/controller";
import {
  isCollOrGroupAdmin,
  isGrantingOpen,
  statusTypeToQuery,
} from "../helpers";
import { combineResolvers } from "graphql-resolvers";

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
    return stripeIsConnected({ round });
  }
);

export const group = async (round, _, { user, ss }) => {
  if (round.singleRound) return null;
  return getGroup({ groupId: round.groupId, user, ss });
};

export const bucketStatusCount = async (
  round,
  { groupSlug, roundSlug },
  { user }
) => {
  const currentMember = await prisma.roundMember.findFirst({
    where: {
      userId: user?.id ?? "undefined",
      round: { slug: roundSlug, group: { slug: groupSlug ?? "c" } },
    },
  });

  const isAdminOrGuide =
    currentMember && (currentMember.isAdmin || currentMember.isModerator);

  return {
    PENDING_APPROVAL: await prisma.bucket.count({
      where: {
        roundId: round.id,
        ...statusTypeToQuery("PENDING_APPROVAL"),
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
        ...statusTypeToQuery("OPEN_FOR_FUNDING"),
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
        ...statusTypeToQuery("FUNDED"),
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
    CANCELED: await prisma.bucket.count({
      where: {
        roundId: round.id,
        ...statusTypeToQuery("CANCELED"),
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
        ...statusTypeToQuery("COMPLETED"),
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
