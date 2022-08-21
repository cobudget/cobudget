//import liveUpdate from "../../services/liveUpdate.service";
import prisma from "../../prisma";
import { GraphQLScalarType } from "graphql";
import GraphQLJSON from "graphql-type-json";
import { GraphQLJSONObject } from "graphql-type-json";
import { Kind } from "graphql/language";
import dayjs from "dayjs";
import { combineResolvers, skip } from "graphql-resolvers";
import { getGroup } from "../../controller";
import {
  bucketIncome,
  bucketMinGoal,
  bucketTotalContributions,
  isCollOrGroupAdmin,
  isGrantingOpen,
  statusTypeToQuery,
  stripeIsConnected,
  bucketMaxGoal,
  getLanguageProgress as languageProgressPage,
} from "./helpers";

//queries
import {
  groupQueries,
  userQueries,
  roundQueries,
  bucketQueries,
} from "./queries";

//mutations
import {
  userMutations,
  groupMutations,
  roundMutations,
  bucketMutations,
} from "./mutations";
import { GroupMember, InvitedMember, RoundMember, User } from "./types";

export const isGroupAdmin = async (parent, { groupId }, { user }) => {
  if (!user) throw new Error("You need to be logged in");
  const groupMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: { groupId: groupId, userId: user.id },
    },
  });
  if (!groupMember?.isAdmin) throw new Error("You need to be group admin");
  return skip;
};

const resolvers = {
  Query: {
    ...userQueries,
    ...groupQueries,
    ...roundQueries,
    ...bucketQueries,
    languageProgressPage,
  },
  Mutation: {
    ...userMutations,
    ...groupMutations,
    ...roundMutations,
    ...bucketMutations,
  },

  RoundMember,
  InvitedMember,
  GroupMember,
  User,

  Group: {
    info: (group) => {
      return group.info && group.info.length
        ? group.info
        : `# Welcome to ${group.name}`;
    },
    rounds: async (group, args, { user }) => {
      return await prisma.round.findMany({
        where: {
          OR: [
            {
              groupId: group.id,
              visibility: "PUBLIC",
            },
            {
              groupId: group.id,
              roundMember: {
                some: { userId: user?.id ?? "undefined", isApproved: true },
              },
            },
          ],
        },
      });
    },
    discourseUrl: async (group) => {
      const discourseConfig = await prisma.discourseConfig.findFirst({
        where: { groupId: group.id },
      });
      return discourseConfig?.url ?? null;
    },
  },
  Round: {
    color: (round) => round.color ?? "anthracit",
    info: (round) => {
      return round.info && round.info.length
        ? round.info
        : `# Welcome to ${round.title}`;
    },
    about: (round) => {
      return round.about && round.about.length
        ? round.about
        : `# About ${round.title}`;
    },
    numberOfApprovedMembers: async (round) => {
      return prisma.roundMember.count({
        where: { roundId: round.id, isApproved: true },
      });
    },
    totalAllocations: async (round) => {
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
    },
    totalContributions: async (round) => {
      const {
        _sum: { amount },
      } = await prisma.contribution.aggregate({
        where: { roundId: round.id },
        _sum: { amount: true },
      });

      return amount;
    },
    totalContributionsFunding: async (round) => {
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
    },
    totalContributionsFunded: async (round) => {
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
    },
    totalInMembersBalances: async (round) => {
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
    },
    tags: async (round) => {
      return prisma.tag.findMany({ where: { roundId: round.id } });
    },
    guidelines: async (round) =>
      prisma.guideline.findMany({ where: { roundId: round.id } }),
    customFields: async (round) =>
      prisma.field.findMany({ where: { roundId: round.id } }),
    grantingIsOpen: (round) => {
      return isGrantingOpen(round);
    },
    grantingHasClosed: (round) => {
      return round.grantingCloses
        ? dayjs(round.grantingCloses).isBefore(dayjs())
        : false;
    },
    bucketCreationIsOpen: (round) => {
      if (!round.bucketCreationCloses) return true;

      const now = dayjs();
      const bucketCreationCloses = dayjs(round.bucketCreationCloses);

      return now.isBefore(bucketCreationCloses);
    },
    stripeIsConnected: combineResolvers(isCollOrGroupAdmin, (round) => {
      return stripeIsConnected({ round });
    }),
    group: async (round, _, { user }) => {
      if (round.singleRound) return null;
      return getGroup({ groupId: round.groupId, user });
    },
    bucketStatusCount: async (round, { groupSlug, roundSlug }, { user }) => {
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
    },
  },
  Bucket: {
    cocreators: async (bucket) => {
      return prisma.bucket
        .findUnique({ where: { id: bucket.id } })
        .cocreators();
    },
    round: async (bucket) => {
      return prisma.bucket.findUnique({ where: { id: bucket.id } }).round();
    },
    totalContributions: async (bucket) => {
      return bucketTotalContributions(bucket);
    },
    totalContributionsFromCurrentMember: async (bucket, args, { user }) => {
      if (!user) return null;
      const roundMember = await prisma.roundMember.findUnique({
        where: {
          userId_roundId: {
            userId: user.id,
            roundId: bucket.roundId,
          },
        },
      });

      if (!roundMember) return 0;

      // TODO: should it be initialized at 0 like below?
      const {
        _sum: { amount = 0 },
      } = await prisma.contribution.aggregate({
        _sum: { amount: true },
        where: {
          bucketId: bucket.id,
          roundMemberId: roundMember.id,
        },
      });
      return amount;
    },
    noOfComments: async (bucket) => {
      // TODO: fix discourse check
      // Only display number of comments for non-Discourse groups
      // if (groupHasDiscourse(currentGroup)) {
      //   return;
      // }
      const comments = await prisma.bucket
        .findUnique({ where: { id: bucket.id } })
        .comments();
      return comments.length;
    },
    contributions: async (bucket) => {
      return await prisma.contribution.findMany({
        where: { bucketId: bucket.id },
        orderBy: {
          createdAt: "desc",
        },
      });
    },
    noOfContributions: async (bucket) => {
      return await prisma.contribution.count({
        where: { bucketId: bucket.id },
      });
    },
    funders: async (bucket) => {
      const funders = await prisma.contribution.groupBy({
        where: { bucketId: bucket.id },
        by: ["roundMemberId"],
        _sum: {
          amount: true,
        },
      });
      const contributionsFormat = funders.map((funder) => ({
        id: funder.roundMemberId,
        roundId: bucket.roundId,
        roundMemberId: funder.roundMemberId,
        bucketId: bucket.id,
        amount: funder._sum.amount,
        createdAt: new Date(),
      }));
      return contributionsFormat;
    },
    noOfFunders: async (bucket) => {
      const contributions = await prisma.bucket
        .findUnique({ where: { id: bucket.id } })
        .Contributions();
      // group contributions by roundMemberId
      const funders = contributions.reduce((acc, contribution) => {
        const { roundMemberId } = contribution;
        if (!acc[roundMemberId]) {
          acc[roundMemberId] = contribution;
        } else {
          acc[roundMemberId].amount += contribution.amount;
        }
        return acc;
      }, {});
      return Object.keys(funders).length;
    },
    raisedFlags: async (bucket) => {
      const resolveFlags = await prisma.flag.findMany({
        where: { bucketId: bucket.id, type: "RESOLVE_FLAG" },
        select: { resolvingFlagId: true },
      });
      const resolveFlagIds = resolveFlags.map((flag) => flag.resolvingFlagId);

      return await prisma.flag.findMany({
        where: {
          bucketId: bucket.id,
          type: "RAISE_FLAG",
          id: { notIn: resolveFlagIds },
        },
      });
    },
    flags: async (bucket) => {
      return await prisma.bucket
        .findUnique({ where: { id: bucket.id } })
        .flags();
    },
    discourseTopicUrl: async (bucket) => {
      const group = await prisma.group.findFirst({
        where: {
          rounds: { some: { buckets: { some: { id: bucket.id } } } },
        },
        include: { discourse: true },
      });
      if (!bucket.discourseTopicId || !group?.discourse?.url) return null;

      return `${group.discourse.url}/t/${bucket.discourseTopicId}`;
    },
    tags: async (bucket) => {
      // TODO: verify
      return prisma.tag.findMany({
        where: { buckets: { some: { id: bucket.id } } },
      });
    },
    images: async (bucket) =>
      prisma.bucket.findUnique({ where: { id: bucket.id } }).Images(),
    customFields: async (bucket) =>
      prisma.bucket.findUnique({ where: { id: bucket.id } }).FieldValues(),
    budgetItems: async (bucket) =>
      prisma.budgetItem.findMany({ where: { bucketId: bucket.id } }),
    published: (bucket) => !!bucket.publishedAt,
    approved: (bucket) => !!bucket.approvedAt,
    canceled: (bucket) => !!bucket.canceledAt,
    funded: (bucket) => !!bucket.fundedAt,
    completed: (bucket) => !!bucket.completedAt,
    income: async (bucket) => {
      return bucketIncome(bucket);
    },
    minGoal: async (bucket) => {
      return bucketMinGoal(bucket);
    },
    maxGoal: async (bucket) => {
      return bucketMaxGoal(bucket);
      const {
        _sum: { min },
      } = await prisma.budgetItem.aggregate({
        _sum: { min: true },
        where: {
          bucketId: bucket.id,
          type: "EXPENSE",
        },
      });

      const budgetItems = await prisma.budgetItem.findMany({
        where: { bucketId: bucket.id, type: "EXPENSE" },
      });

      const maxGoal = budgetItems.reduce(
        (acc, item) => acc + (item.max ? item.max : item.min),
        0
      );

      return maxGoal > 0 && maxGoal !== min ? maxGoal : null;
    },
    status: (bucket, args, ctx) => {
      if (bucket.completedAt) return "COMPLETED";
      if (bucket.canceledAt) return "CANCELED";
      if (bucket.fundedAt) return "FUNDED";
      if (bucket.approvedAt) return "OPEN_FOR_FUNDING";
      return "PENDING_APPROVAL";
    },
  },
  Transaction: {
    __resolveType(transaction) {
      if (transaction.bucketId) {
        return "Contribution";
      }
      return "Allocation"; // GraphQLError is thrown
    },
  },
  Contribution: {
    bucket: async (contribution) => {
      return prisma.bucket.findUnique({
        where: { id: contribution.bucketId },
      });
    },
    round: async (contribution) => {
      return prisma.round.findUnique({
        where: { id: contribution.roundId },
      });
    },
    roundMember: async (contribution) => {
      return prisma.roundMember.findUnique({
        where: { id: contribution.roundMemberId },
      });
    },
  },
  RoundTransaction: {
    roundMember: async (transaction) => {
      return prisma.roundMember.findUnique({
        where: { id: transaction.roundMemberId },
      });
    },
    allocatedBy: async (transaction) => {
      if (transaction.allocatedById)
        return prisma.roundMember.findUnique({
          where: { id: transaction.allocatedById },
        });
      else return null;
    },
    bucket: async (transaction) => {
      if (transaction.bucketId)
        return prisma.bucket.findUnique({
          where: { id: transaction.bucketId },
        });
      else return null;
    },
    round: async (transaction) => {
      return prisma.round.findUnique({
        where: { id: transaction.roundId },
      });
    },
  },
  Comment: {
    roundMember: async (comment) => {
      // make logs anonymous
      if (comment.isLog) return null;

      return prisma.roundMember.findUnique({
        where: {
          id: comment.collMemberId,
        },
      });
    },
  },
  Flag: {
    guideline: async (flag) => {
      if (!flag.guidelineId) return null;
      return prisma.guideline.findUnique({ where: { id: flag.guidelineId } });
    },
    user: async () => {
      // see who left a flag
      // if not group admin or round admin or guide
      return null;
    },
  },
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    },
  }),
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject,
  CustomFieldValue: {
    customField: async (fieldValue) => {
      if (!fieldValue.fieldId) {
        return {
          id: "missing-" + fieldValue.id,
          name: "⚠️ Missing custom field ⚠️",
          description: "Custom field was removed",
          type: "TEXT",
          position: 1000,
          isRequired: false,
          createdAt: new Date(),
        };
      }
      const field = await prisma.fieldValue
        .findUnique({ where: { id: fieldValue.id } })
        .field();
      // const field = await prisma.field.findUnique({
      //   where: { id: fieldValue.fieldId },
      // });

      return field;
    },
  },
};

export default resolvers;
