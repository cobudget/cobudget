import SeededShuffle from "seededshuffle";
import slugify from "../../utils/slugify";
//import liveUpdate from "../../services/liveUpdate.service";
import prisma from "../../prisma";
import { GraphQLScalarType } from "graphql";
import GraphQLJSON from "graphql-type-json";
import { GraphQLJSONObject } from "graphql-type-json";
import { Kind } from "graphql/language";
import dayjs from "dayjs";
import { combineResolvers, skip } from "graphql-resolvers";
import discourse from "../../lib/discourse";
import { allocateToMember } from "../../controller";
import subscribers from "../../subscribers/discourse.subscriber";
import {
  bucketIncome,
  bucketMinGoal,
  bucketTotalContributions,
  canViewRound,
  getRoundMember,
  getCurrentGroupAndMember,
  getGroupMember,
  isAndGetCollMember,
  isAndGetCollMemberOrGroupAdmin,
  isCollAdmin,
  isCollOrGroupAdmin,
  isGrantingOpen,
  roundMemberBalance,
  statusTypeToQuery,
  stripeIsConnected,
} from "./helpers";
import emailService from "server/services/EmailService/email.service";
import { RoundTransaction } from "server/types";
import { sign, verify } from "server/utils/jwt";
import { appLink } from "utils/internalLinks";

const { groupHasDiscourse, generateComment } = subscribers;

const isRootAdmin = (parent, args, { user }) => {
  // TODO: this is old code that doesn't really work right now
  return user && user.isRootAdmin
    ? skip
    : new Error("You need to be root admin");
};

const isMemberOfGroup = async (parent, { groupId }, { user }) => {
  if (!user) throw new Error("You need to be logged in");

  const currentGroupMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: { groupId: groupId, userId: user.id },
    },
  });

  if (!currentGroupMember)
    throw new Error("You need to be a member of that group");
  return skip;
};

const isCollMember = async (parent, { roundId, bucketId }, { user }) => {
  if (!user) throw new Error("You need to be logged in");

  const roundMember = await getRoundMember({
    userId: user.id,
    roundId,
    bucketId,
  });
  // const roundMember = await prisma.roundMember.findUnique({
  //   where: { userId_roundId: { userId: user.id, roundId } },
  // });
  if (!roundMember) {
    throw new Error("Round member does not exist");
  } else if (!roundMember.isApproved) {
    throw new Error("Round member is not approved");
  } else if (!roundMember.hasJoined) {
    throw new Error("Round member has not accepted the invitation");
  }

  return skip;
};

const isCollMemberOrGroupAdmin = async (parent, { roundId }, { user }) => {
  if (!user) throw new Error("You need to be logged in");

  const roundMember = await getRoundMember({
    userId: user.id,
    roundId,
  });

  let groupMember = null;
  if (!roundMember) {
    const group = await prisma.group.findFirst({
      where: { rounds: { some: { id: roundId } } },
    });
    groupMember = await getGroupMember({
      userId: user.id,
      groupId: group.id,
    });
  }

  if (!(roundMember?.isApproved || groupMember?.isAdmin))
    throw new Error(
      "You need to be an approved participant in this round or a group admin to view round participants"
    );
  return skip;
};

const isCollModOrAdmin = async (parent, { bucketId, roundId }, { user }) => {
  if (!user) throw new Error("You need to be logged in");
  const roundMember = await getRoundMember({
    userId: user.id,
    bucketId,
    roundId,
  });

  if (!(roundMember?.isModerator || roundMember?.isAdmin))
    throw new Error("You need to be admin or moderator of the round");
  return skip;
};

const isGroupAdmin = async (parent, { groupId }, { user }) => {
  if (!user) throw new Error("You need to be logged in");
  const groupMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: { groupId: groupId, userId: user.id },
    },
  });
  if (!groupMember?.isAdmin) throw new Error("You need to be group admin");
  return skip;
};

const isBucketCocreatorOrCollAdminOrMod = async (
  parent,
  { bucketId },
  { user }
) => {
  if (!user) throw new Error("You need to be logged in");
  if (!bucketId) throw new Error("You need to provide bucketId");

  const bucket = await prisma.bucket.findUnique({
    where: { id: bucketId },
    include: { cocreators: true, round: true },
  });

  const roundMember = await prisma.roundMember.findUnique({
    where: {
      userId_roundId: {
        userId: user.id,
        roundId: bucket.roundId,
      },
    },
  });

  if (
    !roundMember ||
    (!bucket.cocreators.map((m) => m.id).includes(roundMember.id) &&
      !roundMember.isAdmin &&
      !roundMember.isModerator)
  )
    throw new Error("You are not a cocreator of this bucket.");

  return skip;
};

const resolvers = {
  Query: {
    currentUser: async (parent, args, { user }) => {
      return user
        ? await prisma.user.findUnique({ where: { id: user.id } })
        : null;
    },
    user: async (parent, { userId }) => {
      // we let the resolvers grab any extra requested fields, so we don't accidentally leak e.g. emails
      return prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
    },
    group: async (parent, { groupSlug }) => {
      if (!groupSlug) return null;
      if (process.env.SINGLE_GROUP_MODE !== "true" && groupSlug == "c")
        return null;

      return prisma.group.findUnique({ where: { slug: groupSlug } });
    },
    groups: combineResolvers(isRootAdmin, async (parent, args) => {
      return prisma.group.findMany();
    }),
    rounds: async (parent, { limit, groupSlug }, { user }) => {
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
    },
    round: async (parent, { groupSlug, roundSlug }, { user }) => {
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
    },
    roundInvitationLink: async (parent, { roundId }, { user }) => {
      const isAdmin =
        !!user &&
        isCollAdmin({
          userId: user.id,
          roundId,
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
    },
    contributionsPage: combineResolvers(
      isCollMemberOrGroupAdmin,
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
    ),
    roundTransactions: combineResolvers(
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
          (transaction) =>
            (transaction.createdAt = new Date(transaction.createdAt))
        );

        return {
          moreExist: transactions.length > limit,
          transactions: transactions.slice(0, limit),
        };
      }
    ),
    bucket: async (parent, { id }) => {
      if (!id) return null;
      const bucket = await prisma.bucket.findUnique({ where: { id } });
      if (!bucket || bucket.deleted) return null;
      return bucket;
    },
    bucketsPage: async (
      parent,
      {
        roundSlug,
        groupSlug,
        textSearchTerm,
        tag: tagValue,
        offset = 0,
        limit,
        status,
      },
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

      const statusFilter = status.map(statusTypeToQuery).filter((s) => s);

      const buckets = await prisma.bucket.findMany({
        where: {
          round: { slug: roundSlug, group: { slug: groupSlug ?? "c" } },
          deleted: { not: true },
          OR: statusFilter,
          ...(textSearchTerm && { title: { search: textSearchTerm } }),
          ...(tagValue && {
            tags: { some: { value: tagValue } },
          }),
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
      });

      const todaySeed = dayjs().format("YYYY-MM-DD");

      const shuffledBuckets = SeededShuffle.shuffle(
        buckets,
        user ? user.id + todaySeed : todaySeed
      );

      return {
        moreExist: shuffledBuckets.length > limit + offset,
        buckets: shuffledBuckets.slice(offset, limit + offset),
      };
    },
    groupMembersPage: combineResolvers(
      isGroupAdmin,
      async (parent, { offset = 0, limit, groupId }, { user }) => {
        const groupMembersWithExtra = await prisma.groupMember.findMany({
          where: { groupId: groupId },
          skip: offset,
          take: limit + 1,
        });

        return {
          moreExist: groupMembersWithExtra.length > limit,
          groupMembers: groupMembersWithExtra.slice(0, limit),
        };
      }
    ),
    members: combineResolvers(
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
    ),
    membersPage: combineResolvers(
      isCollMemberOrGroupAdmin,
      async (
        parent,
        { roundId, isApproved, search, offset = 0, limit = 10 },
        { user }
      ) => {
        const isAdmin = await isCollAdmin({
          userId: user.id,
          roundId,
        });
        if (!isAdmin && !isApproved) return null;

        const roundMembersWithExtra = await prisma.roundMember.findMany({
          where: {
            roundId,
            isApproved,
            ...(!isApproved && { isRemoved: false }),
            ...(search && {
              OR: [
                {
                  user: {
                    username: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  user: {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
              ],
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
    ),
    categories: async (parent, { groupId }) => {
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
    },
    commentSet: async (
      parent,
      { bucketId, from = 0, limit = 30, order = "desc" }
    ) => {
      const bucket = await prisma.bucket.findUnique({
        where: { id: bucketId },
        include: {
          comments: true,
          round: {
            include: { group: { include: { discourse: true } } },
          },
        },
      });
      // const bucket = await Bucket.findOne({ _id: bucketId });

      let comments;
      const group = bucket.round.group;

      if (groupHasDiscourse(group)) {
        const topic = await discourse(group.discourse).posts.get(
          bucket.discourseTopicId
        );

        comments = await Promise.all(
          topic.post_stream.posts
            .filter((post) => post.post_number > 1)
            .filter((post) => !post.user_deleted)
            // filter out empty system comments, e.g. when a thread is moved
            .filter(
              (comment) =>
                !(comment.username === "system" && comment.raw === "")
            )
            .reverse()
            .map(async (post) => {
              const author = await prisma.roundMember.findFirst({
                where: {
                  roundId: bucket.roundId,
                  user: {
                    groupMemberships: {
                      some: {
                        discourseUsername: post.username,
                        groupId: group.id,
                      },
                    },
                  },
                },
              });

              return generateComment(post, author);
            })
        );
      } else {
        comments = await prisma.comment.findMany({
          where: { bucketId: bucketId },
          orderBy: { createdAt: "desc" },
        });
      }

      let shown = comments.slice(0, from + limit);

      if (order === "desc") {
        shown = shown.reverse();
      }

      return {
        total: comments.length,
        comments: shown,
      };
    },
  },
  Mutation: {
    createGroup: async (parent, { name, slug, logo }, { user, eventHub }) => {
      if (!user) throw new Error("You need to be logged in!");

      const group = await prisma.group.create({
        data: {
          name,
          slug: slugify(slug),
          logo,
          groupMembers: { create: { userId: user.id, isAdmin: true } },
        },
        include: {
          groupMembers: true,
        },
      });

      await eventHub.publish("create-group", {
        currentGroup: group,
        currentGroupMember: group.groupMembers[0],
      });

      return group;
    },
    editGroup: combineResolvers(
      isGroupAdmin,
      async (
        parent,
        { groupId, name, info, slug, logo },
        { user, eventHub }
      ) => {
        if (name?.length === 0) throw new Error("Group name cannot be blank");
        if (slug?.length === 0) throw new Error("Group slug cannot be blank");
        if (info?.length > 500) throw new Error("Group info too long");

        const group = await prisma.group.update({
          where: {
            id: groupId,
          },
          data: {
            name,
            info,
            logo,
            slug: slug !== undefined ? slugify(slug) : undefined,
          },
        });

        // TODO: add back
        // await eventHub.publish("edit-group", {
        //   currentGroup: group,
        //   currentGroupMember,
        // });
        return group;
      }
    ),
    setTodosFinished: combineResolvers(
      isGroupAdmin,
      async (parent, { groupId }) => {
        const group = await prisma.group.update({
          where: { id: groupId },
          data: { finishedTodos: true },
        });
        return group;
      }
    ),
    createRound: async (
      parent,
      { groupId, slug, title, currency, registrationPolicy },
      { user }
    ) => {
      let singleRound = false;
      if (!groupId) {
        let rootGroup = await prisma.group.findUnique({
          where: { slug: "c" },
        });
        if (!rootGroup) {
          rootGroup = await prisma.group.create({
            data: { slug: "c", name: "Root" },
          });
        }
        groupId = rootGroup.id;
        singleRound = true;
      } else {
        await isGroupAdmin(null, { groupId }, { user });
      }
      const round = await prisma.round.create({
        data: {
          slug,
          title,
          currency,
          registrationPolicy,
          group: { connect: { id: groupId } },
          singleRound,
          statusAccount: { create: {} },
          roundMember: {
            create: {
              user: { connect: { id: user.id } },
              isAdmin: true,
              isApproved: true,
              statusAccount: { create: {} },
              incomingAccount: { create: {} },
              outgoingAccount: { create: {} },
            },
          },
          fields: {
            create: {
              name: "Description",
              description: "Describe your bucket",
              type: "MULTILINE_TEXT",
              isRequired: false,
              position: 1001,
            },
          },
        },
      });

      // await eventHub.publish("create-round", {
      //   currentGroup,
      //   currentGroupMember,
      //   round: round,
      // });

      return round;
    },
    editRound: combineResolvers(
      isCollOrGroupAdmin,
      async (
        parent,
        {
          roundId,
          slug,
          title,
          archived,
          registrationPolicy,
          visibility,
          info,
          color,
          about,
          bucketReviewIsOpen,
          discourseCategoryId,
        }
      ) => {
        return prisma.round.update({
          where: { id: roundId },
          data: {
            ...(slug && { slug: slugify(slug) }),
            title,
            archived,
            registrationPolicy,
            visibility,
            info,
            about,
            color,
            bucketReviewIsOpen,
            discourseCategoryId,
          },
        });
      }
    ),
    createRoundInvitationLink: async (parent, { roundId }, { user }) => {
      const isAdmin =
        (await !!user) &&
        isCollAdmin({
          userId: user?.id,
          roundId,
        });

      if (!isAdmin) {
        throw new Error("You need to be admin to create invitation link");
      }

      const inviteNonce = Date.now();
      const round = await prisma.round.update({
        where: { id: roundId },
        data: { inviteNonce },
      });
      return {
        link: round.inviteNonce,
      };
    },
    deleteRoundInvitationLink: async (parent, { roundId }, { user }) => {
      const isAdmin =
        (await !!user) &&
        isCollAdmin({
          userId: user?.id,
          roundId,
        });

      if (!isAdmin) {
        throw new Error("You need to be admin to create delete link");
      }

      await prisma.round.update({
        where: { id: roundId },
        data: { inviteNonce: null },
      });
      return {
        link: null,
      };
    },
    joinRoundInvitationLink: async (parent, { token }, { user }) => {
      if (!user) {
        throw new Error("You need to be logged in to join the group");
      }

      const payload = verify(token);

      if (!payload) {
        throw new Error("Invalid invitation link");
      }

      const { roundId, nonce: inviteNonce } = payload;

      const round = await prisma.round.findFirst({
        where: { id: roundId, inviteNonce },
      });

      if (!round) {
        throw new Error("Round link expired");
      }

      const isApproved = true;
      const roundMember = await prisma.roundMember.upsert({
        where: { userId_roundId: { userId: user.id, roundId } },
        create: {
          round: { connect: { id: roundId } },
          user: { connect: { id: user.id } },
          isApproved,
          statusAccount: { create: {} },
          incomingAccount: { create: {} },
          outgoingAccount: { create: {} },
        },
        update: { isApproved, hasJoined: true, isRemoved: false },
      });

      return roundMember;
    },
    deleteRound: combineResolvers(
      isCollOrGroupAdmin,
      async (parent, { roundId }) =>
        prisma.round.update({
          where: { id: roundId },
          data: { deleted: true },
        })
    ),
    addGuideline: combineResolvers(
      isCollOrGroupAdmin,
      async (parent, { roundId, guideline: { title, description } }) => {
        const guidelines = await prisma.guideline.findMany({
          where: { roundId: roundId },
        });

        const position =
          guidelines
            .map((g) => g.position)
            .reduce((a, b) => Math.max(a, b), 1000) + 1;

        const guideline = await prisma.guideline.create({
          data: { roundId: roundId, title, description, position },
          include: { round: true },
        });
        return guideline.round;
      }
    ),
    editGuideline: combineResolvers(
      isCollOrGroupAdmin,
      async (
        parent,
        { roundId, guidelineId, guideline: { title, description } }
      ) => {
        const round = await prisma.round.findUnique({
          where: { id: roundId },
          include: { guidelines: true },
        });

        if (!round.guidelines.map((g) => g.id).includes(guidelineId))
          throw new Error("This guideline is not part of this round");

        const guideline = await prisma.guideline.update({
          where: { id: guidelineId },
          data: { title, description },
          include: { round: true },
        });

        return guideline.round;
      }
    ),
    setGuidelinePosition: combineResolvers(
      isCollOrGroupAdmin,
      async (parent, { roundId, guidelineId, newPosition }, { user }) => {
        const round = await prisma.round.findUnique({
          where: { id: roundId },
          include: { guidelines: true },
        });

        if (!round.guidelines.map((g) => g.id).includes(guidelineId))
          throw new Error("This guideline is not part of this round");

        const guideline = await prisma.guideline.update({
          where: { id: guidelineId },
          data: { position: newPosition },
          include: { round: true },
        });

        return guideline.round;
      }
    ),
    deleteGuideline: combineResolvers(
      isCollOrGroupAdmin,
      async (parent, { roundId, guidelineId }) =>
        prisma.round.update({
          where: { id: roundId },
          data: { guidelines: { delete: { id: guidelineId } } },
        })
    ),
    addCustomField: combineResolvers(
      isCollOrGroupAdmin,
      async (
        parent,
        { roundId, customField: { name, description, type, limit, isRequired } }
      ) => {
        const customFields = await prisma.field.findMany({
          where: { roundId: roundId },
        });

        const position =
          customFields
            .map((g) => g.position)
            .reduce((a, b) => Math.max(a, b), 1000) + 1;

        const customField = await prisma.field.create({
          data: {
            roundId: roundId,
            name,
            description,
            type,
            limit,
            isRequired,
            position,
          },
          include: { round: true },
        });
        return customField.round;
      }
    ),
    // Based on https://softwareengineering.stackexchange.com/a/195317/54663
    setCustomFieldPosition: combineResolvers(
      isCollOrGroupAdmin,
      async (parent, { roundId, fieldId, newPosition }) => {
        const round = await prisma.round.findUnique({
          where: { id: roundId },
          include: { fields: true },
        });
        if (!round.fields.map((g) => g.id).includes(fieldId))
          throw new Error("This field is not part of this round");

        const field = await prisma.field.update({
          where: { id: fieldId },
          data: { position: newPosition },
          include: { round: true },
        });

        return field.round;
      }
    ),
    editCustomField: combineResolvers(
      isCollOrGroupAdmin,
      async (
        parent,
        {
          roundId,
          fieldId,
          customField: { name, description, type, limit, isRequired },
        }
      ) => {
        const round = await prisma.round.findUnique({
          where: { id: roundId },
          include: { fields: true },
        });
        if (!round.fields.map((g) => g.id).includes(fieldId))
          throw new Error("This field is not part of this round");

        const field = await prisma.field.update({
          where: { id: fieldId },
          data: { name, description, type, limit, isRequired },
          include: { round: true },
        });

        return field.round;
      }
    ),
    deleteCustomField: combineResolvers(
      isCollOrGroupAdmin,
      async (parent, { roundId, fieldId }) =>
        prisma.round.update({
          where: { id: roundId },
          data: { fields: { delete: { id: fieldId } } },
        })
    ),
    createBucket: combineResolvers(
      isCollMember,
      async (parent, { roundId, title }, { user, eventHub }) => {
        const round = await prisma.round.findUnique({
          where: { id: roundId },
          include: {
            group: {
              include: {
                groupMembers: { where: { userId: user.id } },
                discourse: true,
              },
            },
          },
        });

        const currentGroupMember = round?.group?.groupMembers?.[0];

        const bucketCreationIsOpen = round.bucketCreationCloses
          ? dayjs().isBefore(dayjs(round.bucketCreationCloses))
          : true;

        if (!bucketCreationIsOpen)
          throw new Error("Bucket creation is not open");

        const bucket = await prisma.bucket.create({
          data: {
            round: { connect: { id: roundId } },
            title,
            statusAccount: { create: {} },
            outgoingAccount: { create: {} },
            cocreators: {
              connect: {
                userId_roundId: { userId: user.id, roundId },
              },
            },
          },
        });

        await eventHub.publish("create-bucket", {
          currentGroup: round.group,
          currentGroupMember,
          bucket: bucket,
          round: round,
        });

        return bucket;
      }
    ),
    editBucket: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (
        parent,
        { bucketId, title, description, summary, images, budgetItems },
        { user, eventHub }
      ) => {
        const updated = await prisma.bucket.update({
          where: { id: bucketId },
          data: {
            title,
            description,
            summary,
            ...(typeof budgetItems !== "undefined" && {
              BudgetItems: {
                deleteMany: {},
                createMany: { data: budgetItems },
              },
            }),
            ...(typeof images !== "undefined" && {
              Images: { deleteMany: {}, createMany: { data: images } },
            }),
          },
          include: {
            Images: true,
            FieldValues: true,
            BudgetItems: true,
            round: {
              include: {
                fields: true,
                group: {
                  include: {
                    discourse: true,
                    groupMembers: { where: { userId: user.id } },
                  },
                },
              },
            },
          },
        });

        await eventHub.publish("edit-bucket", {
          currentGroup: updated.round.group,
          currentGroupMember: updated.round.group?.groupMembers?.[0],
          round: updated.round,
          bucket: updated,
        });

        return updated;
      }
    ),
    createTag: combineResolvers(
      isCollModOrAdmin,
      async (parent, { roundId, tagValue }) => {
        return await prisma.round.update({
          where: { id: roundId },
          data: {
            tags: {
              create: {
                value: tagValue,
              },
            },
          },
        });
      }
    ),
    addTag: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (parent, { bucketId, tagId }) => {
        if (!tagId) throw new Error("You need to provide tag id");

        return await prisma.bucket.update({
          where: { id: bucketId },
          data: {
            tags: {
              connect: {
                id: tagId,
              },
            },
          },
        });
      }
    ),
    // removes a tag from all buckets it's added to, and then deletes it
    deleteTag: combineResolvers(
      isCollModOrAdmin,
      async (_, { roundId, tagId }) => {
        // verify that the tag is part of this round
        const tag = await prisma.tag.findUnique({
          where: {
            id: tagId,
          },
        });
        if (tag?.roundId !== roundId) throw new Error("Incorrect round");

        await prisma.tag.delete({
          where: { id: tagId },
        });

        return await prisma.round.findUnique({
          where: { id: roundId },
          include: { tags: true },
        });
      }
    ),
    // removes a tag from a specific bucket
    removeTag: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (_, { bucketId, tagId }) =>
        prisma.bucket.update({
          where: { id: bucketId },
          data: { tags: { disconnect: { id: tagId } } },
        })
    ),
    editBucketCustomField: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (
        parent,
        { bucketId, customField: { fieldId, value } },
        { user, eventHub }
      ) => {
        const updated = await prisma.bucket.update({
          where: { id: bucketId },
          data: {
            FieldValues: {
              upsert: {
                where: { bucketId_fieldId: { bucketId: bucketId, fieldId } },
                create: { fieldId, value },
                update: { value },
              },
            },
          },
          include: {
            Images: true,
            FieldValues: true,
            BudgetItems: true,
            round: {
              include: {
                fields: true,
                group: {
                  include: {
                    discourse: true,
                    groupMembers: { where: { userId: user.id } },
                  },
                },
              },
            },
          },
        });

        await eventHub.publish("edit-bucket", {
          currentGroup: updated.round.group,
          currentGroupMember: updated.round.group?.groupMembers?.[0],
          round: updated.round,
          bucket: updated,
        });

        return updated;
      }
    ),
    deleteBucket: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (_, { bucketId }, { user, eventHub }) => {
        const {
          _sum: { amount: contributionsForBucket },
        } = await prisma.contribution.aggregate({
          where: { bucketId },
          _sum: { amount: true },
        });

        if (contributionsForBucket > 0) {
          throw new Error(
            "You cant delete a bucket that has received contributions"
          );
        }

        const bucket = await prisma.bucket.update({
          where: { id: bucketId },
          data: { deleted: true },
          include: {
            round: {
              include: {
                group: {
                  include: { groupMembers: { where: { userId: user.id } } },
                },
              },
            },
          },
        });

        await eventHub.publish("delete-bucket", {
          currentGroup: bucket.round.group,
          currentGroupMember: bucket.round.group?.groupMembers?.[0],
          round: bucket.round,
          bucket: bucket,
        });

        return bucket;
      }
    ),
    addCocreator: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (parent, { bucketId, memberId }) =>
        prisma.bucket.update({
          where: { id: bucketId },
          data: {
            cocreators: {
              connect: { id: memberId },
            },
          },
        })
    ),
    removeCocreator: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (_, { bucketId, memberId }) =>
        prisma.bucket.update({
          where: { id: bucketId },
          data: { cocreators: { disconnect: { id: memberId } } },
        })
    ),
    publishBucket: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (_, { bucketId, unpublish }, { user, eventHub }) => {
        const bucket = await prisma.bucket.findUnique({
          where: { id: bucketId },
          include: {
            round: {
              include: {
                group: {
                  include: {
                    groupMembers: { where: { userId: user.id } },
                    discourse: true,
                  },
                },
              },
            },
          },
        });

        const publishedAt = unpublish ? null : new Date();
        const resultBucket = await prisma.bucket.update({
          where: { id: bucket.id },
          data: { publishedAt },
        });

        await eventHub.publish("publish-bucket", {
          currentGroup: bucket.round.group,
          currentGroupMember: bucket.round.group?.groupMembers?.[0],
          round: bucket.round,
          bucket: bucket,
          unpublish,
        });

        return resultBucket;
      }
    ),
    addComment: combineResolvers(
      isCollMember,
      async (_, { content, bucketId }, { user, eventHub }) => {
        const bucket = await prisma.bucket.findUnique({
          where: { id: bucketId },
          include: {
            round: {
              include: {
                roundMember: { where: { userId: user.id } },
                group: {
                  include: {
                    discourse: true,
                    groupMembers: { where: { userId: user.id } },
                  },
                },
              },
            },
          },
        });
        const currentGroup = bucket.round.group;
        const currentGroupMember = currentGroup?.groupMembers?.[0];
        const currentCollMember = bucket.round.roundMember?.[0];

        if (
          groupHasDiscourse(currentGroup) &&
          !currentGroupMember.discourseApiKey
        ) {
          throw new Error(
            "You need to have a discourse account connected, go to /connect-discourse"
          );
        }

        if (content.length < (currentGroup?.discourse?.minPostLength || 3)) {
          throw new Error(
            `Your post needs to be at least ${
              currentGroup.discourse?.minPostLength || 3
            } characters long!`
          );
        }

        const comment = { content, collMemberId: currentCollMember.id };

        const { discourse, prisma: prismaResult } = await eventHub.publish(
          "create-comment",
          {
            currentGroup,
            currentGroupMember,
            currentCollMember,
            currentUser: user,
            bucket: bucket,
            round: bucket.round,
            comment,
          }
        );

        return discourse || prismaResult;
      }
    ),

    deleteComment: combineResolvers(
      isCollMember,
      async (_, { bucketId, commentId }, { user, eventHub }) => {
        const bucket = await prisma.bucket.findUnique({
          where: { id: bucketId },
          include: {
            comments: { where: { id: commentId } },
            round: {
              include: {
                roundMember: { where: { userId: user.id } },
                group: {
                  include: {
                    groupMembers: { where: { userId: user.id } },
                    discourse: true,
                  },
                },
              },
            },
          },
        });
        const currentGroup = bucket.round.group;
        const currentGroupMember = currentGroup?.groupMembers?.[0];
        const currentCollMember = bucket.round.roundMember?.[0];
        const comment = bucket.comments?.[0];

        await eventHub.publish("delete-comment", {
          currentGroup,
          currentGroupMember,
          round: bucket.round,
          currentCollMember,
          bucket: bucket,
          comment,
        });

        return comment;
      }
    ),
    editComment: combineResolvers(
      isCollMember,
      async (parent, { bucketId, commentId, content }, { user, eventHub }) => {
        let comment = await prisma.comment.findUnique({
          where: { id: commentId },
          include: { bucket: { include: { round: true } } },
        });
        comment = { ...comment, content };

        const currentCollMember = await prisma.roundMember.findUnique({
          where: {
            userId_roundId: {
              userId: user.id,
              roundId: comment.bucket.round.id,
            },
          },
          include: {
            user: true,
            round: {
              include: {
                group: {
                  include: {
                    groupMembers: { where: { userId: user.id } },
                    discourse: true,
                  },
                },
              },
            },
          },
        });

        // TODO: permissions?
        //if (!roundMember || comment.groupMemberId !== currentGroupMember)
        const { discourse, prisma: prismaResult } = await eventHub.publish(
          "edit-comment",
          {
            currentGroup: currentCollMember.round.group,
            currentGroupMember:
              currentCollMember.round.group?.groupMembers?.[0],
            currentCollMember,
            bucket: comment.bucket,
            comment,
          }
        );
        return discourse || prismaResult;
      }
    ),
    raiseFlag: async (parent, { bucketId, guidelineId, comment }, { user }) => {
      const currentCollMember = await isAndGetCollMember({
        bucketId,
        userId: user.id,
      });

      // todo: check not already left a flag?
      const bucket = await prisma.bucket.findUnique({
        where: { id: bucketId },
        include: {
          round: true,
        },
      });

      if (!bucket.round.bucketReviewIsOpen || !bucket.publishedAt)
        throw new Error(
          "You can only review buckets when bucket review is open and the bucket is published"
        );

      if (!currentCollMember || !currentCollMember.isApproved)
        throw new Error("You need to be logged in and/or approved");

      let updated = await prisma.bucket.update({
        where: { id: bucketId },
        data: {
          flags: {
            create: {
              guidelineId,
              type: "RAISE_FLAG",
              collMemberId: currentCollMember.id,
              comment,
            },
          },
        },
        include: {
          round: {
            include: {
              guidelines: { where: { id: guidelineId } },
              group: { include: { discourse: true } },
            },
          },
        },
      });

      const logContent = `Someone flagged this bucket for the **${updated.round.guidelines[0].title}** guideline: \n> ${comment}`;
      const currentGroup = updated.round.group;
      if (groupHasDiscourse(currentGroup)) {
        if (!updated.discourseTopicId) {
          // TODO: break out create thread into separate function
          const discoursePost = await discourse(
            currentGroup.discourse
          ).posts.create(
            {
              title: bucket.title,
              raw: `https://${process.env.DEPLOY_URL}/${currentGroup.slug}/${bucket.round.slug}/${bucket.id}`,
              ...(currentGroup.discourse.dreamsCategoryId && {
                category: currentGroup.discourse.dreamsCategoryId,
              }),
            },
            {
              username: "system",
            }
          );
          updated = await prisma.bucket.update({
            where: { id: bucketId },
            data: { discourseTopicId: discoursePost.topic_id },
            include: {
              round: {
                include: {
                  guidelines: { where: { id: guidelineId } },
                  group: { include: { discourse: true } },
                },
              },
            },
          });
        }

        await discourse(currentGroup.discourse).posts.create(
          {
            topic_id: updated.discourseTopicId,
            raw: logContent,
          },
          { username: "system" }
        );
      } else {
        await prisma.comment.create({
          data: {
            content: logContent,
            isLog: true,
            collMemberId: currentCollMember.id,
            bucketId,
          },
        });
      }

      return updated;
    },
    resolveFlag: async (parent, { bucketId, flagId, comment }, { user }) => {
      const currentCollMember = await isAndGetCollMember({
        bucketId,
        userId: user.id,
      });

      // todo: check not already left a flag?
      const bucket = await prisma.bucket.findUnique({
        where: { id: bucketId },
        include: {
          round: true,
          flags: {
            where: { id: flagId },
            include: { guideline: true },
          },
        },
      });

      if (!bucket.round.bucketReviewIsOpen || !bucket.publishedAt)
        throw new Error(
          "You can only review buckets when bucket review is open and the bucket is published"
        );

      if (!currentCollMember || !currentCollMember.isApproved)
        throw new Error("You need to be logged in and/or approved");

      let updated = await prisma.bucket.update({
        where: { id: bucketId },
        data: {
          flags: {
            create: {
              resolvingFlagId: flagId,
              type: "RESOLVE_FLAG",
              collMemberId: currentCollMember.id,
              comment,
            },
          },
        },
        include: {
          round: {
            include: { group: { include: { discourse: true } } },
          },
        },
      });
      const currentGroup = updated.round.group;
      const resolvedFlagGuideline = bucket.flags[0].guideline;

      const logContent = `Someone resolved a flag for the **${resolvedFlagGuideline.title}** guideline: \n> ${comment}`;

      if (groupHasDiscourse(currentGroup)) {
        if (!bucket.discourseTopicId) {
          // TODO: break out create thread into separate function
          const discoursePost = await discourse(
            currentGroup.discourse
          ).posts.create(
            {
              title: bucket.title,
              raw: `https://${process.env.DEPLOY_URL}/${currentGroup.slug}/${bucket.round.slug}/${bucket.id}`,
              ...(currentGroup.discourse.dreamsCategoryId && {
                category: currentGroup.discourse.dreamsCategoryId,
              }),
            },
            {
              username: "system",
            }
          );
          updated = await prisma.bucket.update({
            where: { id: bucketId },
            data: { discourseTopicId: discoursePost.topic_id },
            include: {
              round: {
                include: { group: { include: { discourse: true } } },
              },
            },
          });
        }
        await discourse(currentGroup.discourse).posts.create(
          {
            topic_id: updated.discourseTopicId,
            raw: logContent,
          },
          { username: "system" }
        );
      } else {
        await prisma.comment.create({
          data: {
            content: logContent,
            isLog: true,
            collMemberId: currentCollMember.id,
            bucketId: bucket.id,
          },
        });
      }

      return updated;
    },
    allGoodFlag: async (parent, { bucketId }, { user }) => {
      const currentCollMember = await isAndGetCollMember({
        bucketId,
        userId: user.id,
      });

      const bucket = await prisma.bucket.findUnique({
        where: { id: bucketId },
        include: {
          round: true,
          flags: {
            where: {
              collMemberId: currentCollMember.id,
              type: "ALL_GOOD_FLAG",
            },
          },
        },
      });

      if (!bucket.round.bucketReviewIsOpen || !bucket.publishedAt)
        throw new Error(
          "You can only review buckets when bucket review is open and the bucket is published"
        );

      if (bucket.flags.length) {
        return bucket;
        // TODO: update the ui to stop the user from doing this. in what way?
        //throw new Error("You have already left an all good flag");
      }

      return await prisma.bucket.update({
        where: { id: bucketId },
        data: {
          flags: {
            create: {
              type: "ALL_GOOD_FLAG",
              collMemberId: currentCollMember.id,
            },
          },
        },
      });
    },

    joinGroup: async (_, { groupId }, { user }) => {
      if (!user) throw new Error("You need to be logged in.");

      return await prisma.groupMember.create({
        data: { userId: user.id, groupId: groupId },
      });
    },
    updateProfile: async (_, { name, username }, { user }) => {
      if (!user) throw new Error("You need to be logged in..");

      return prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          username,
        },
      });
    },
    updateBio: async (_, { roundId, bio }, { user }) => {
      if (!user) throw new Error("You need to be logged in..");

      return prisma.roundMember.update({
        where: { userId_roundId: { userId: user.id, roundId } },
        data: {
          bio,
        },
      });
    },
    inviteRoundMembers: combineResolvers(
      isCollOrGroupAdmin,
      async (_, { emails: emailsString, roundId }, { user: currentUser }) => {
        const round = await prisma.round.findUnique({
          where: { id: roundId },
          include: { group: true },
        });
        const emails = emailsString.split(",");

        if (emails.length > 1000)
          throw new Error("You can only invite 1000 people at a time");

        const invitedRoundMembers = [];

        for (let email of emails) {
          email = email.trim().toLowerCase();

          const user = await prisma.user.findUnique({
            where: { email },
          });

          const updated = await prisma.user.upsert({
            where: { email },
            create: {
              email,
              collMemberships: {
                create: {
                  isApproved: true,
                  round: { connect: { id: roundId } },
                  hasJoined: false,
                  statusAccount: { create: {} },
                  incomingAccount: { create: {} },
                  outgoingAccount: { create: {} },
                },
              },
            },
            update: {
              collMemberships: {
                upsert: {
                  create: {
                    isApproved: true,
                    round: { connect: { id: roundId } },
                    hasJoined: false,
                    statusAccount: { create: {} },
                    incomingAccount: { create: {} },
                    outgoingAccount: { create: {} },
                  },
                  update: {
                    isApproved: true,
                    isRemoved: false,
                  },
                  where: {
                    userId_roundId: {
                      userId: user?.id ?? "undefined",
                      roundId,
                    },
                  },
                },
              },
            },
            include: { collMemberships: { where: { roundId } } },
          });

          await emailService.inviteMember({ email, currentUser, round });

          invitedRoundMembers.push(updated.collMemberships?.[0]);
        }
        return invitedRoundMembers;
      }
    ),
    inviteGroupMembers: combineResolvers(
      isGroupAdmin,
      async (_, { groupId, emails: emailsString }, { user: currentUser }) => {
        const emails: string[] = emailsString.split(",");

        if (emails.length > 1000)
          throw new Error("You can only invite 1000 people at a time");

        const newGroupMembers = [];

        for (let email of emails) {
          email = email.trim().toLowerCase();

          const user = await prisma.user.upsert({
            where: {
              email,
            },
            create: {
              groupMemberships: { create: { groupId: groupId } },
              email,
            },
            update: {
              groupMemberships: {
                create: {
                  groupId: groupId,
                },
              },
            },
            include: {
              groupMemberships: {
                where: { groupId: groupId },
                include: { group: true },
              },
            },
          });
          const groupMembership = user.groupMemberships?.[0];
          const currentGroup = groupMembership.group;

          await emailService.inviteMember({ email, currentUser, currentGroup });

          newGroupMembers.push(groupMembership);
        }

        return newGroupMembers;
      }
    ),
    updateGroupMember: combineResolvers(
      isGroupAdmin,
      async (parent, { groupId, memberId, isAdmin }, { user }) => {
        const groupMember = await prisma.groupMember.findFirst({
          where: { id: memberId, groupId: groupId },
        });

        if (!groupMember) throw new Error("No member to update found");

        if (typeof isAdmin !== "undefined") {
          if (isAdmin === false) {
            const groupAdmins = await prisma.groupMember.findMany({
              where: { groupId: groupId, isAdmin: true },
            });
            if (groupAdmins.length <= 1)
              throw new Error("You need at least 1 group admin");
          }
          groupMember.isAdmin = isAdmin;
        }
        return await prisma.groupMember.update({
          where: { id: groupMember.id },
          data: { ...groupMember },
        });
      }
    ),
    deleteGroupMember: combineResolvers(
      isGroupAdmin,
      async (parent, { groupId, groupMemberId }) => {
        return prisma.groupMember.delete({
          where: { id: groupMemberId },
        });
      }
    ),
    updateMember: combineResolvers(
      isCollOrGroupAdmin,
      async (
        parent,
        { roundId, memberId, isApproved, isAdmin, isModerator }
      ) => {
        const roundMember = await prisma.roundMember.findFirst({
          where: { roundId, id: memberId },
        });
        if (!roundMember)
          throw new Error("This member does not exist in this round");

        return prisma.roundMember.update({
          where: { id: memberId },
          data: {
            isApproved,
            isAdmin,
            isModerator,
          },
        });
      }
    ),
    deleteMember: combineResolvers(
      isCollOrGroupAdmin,
      async (parent, { roundId, memberId }) => {
        const roundMember = await prisma.roundMember.findUnique({
          where: { id: memberId },
        });
        if (!roundMember)
          throw new Error("This member does not exist in this collection");

        if ((await roundMemberBalance(roundMember)) !== 0) {
          throw new Error(
            "You can only remove a round participant with 0 balance"
          );
        }

        return prisma.roundMember.update({
          where: { id: memberId },
          data: {
            isApproved: false,
            hasJoined: false,
            isRemoved: true,
            isAdmin: false,
            isModerator: false,
          },
        });
      }
    ),
    // deleteGroup: async (parent, { groupId }, { user }) => {
    //   const { currentGroupMember } = await getCurrentGroupAndMember({
    //     groupId: groupId,
    //     user,
    //   });

    //   if (
    //     !(
    //       (currentGroupMember &&
    //         currentGroupMember.isAdmin &&
    //         groupId == currentGroupMember.groupId) ||
    //       user.isRootAdmin
    //     )
    //   )
    //     throw new Error(
    //       "You need to be group. or root admin to delete an group"
    //     );
    //   //TODO: turn into soft delete
    //   return prisma.group.delete({ where: { id: groupId } });
    // },
    approveForGranting: combineResolvers(
      async (parent, args, ctx) => {
        const round = await prisma.round.findFirst({
          where: { buckets: { some: { id: args.bucketId } } },
        });

        return round.requireBucketApproval
          ? isCollModOrAdmin(parent, args, ctx)
          : isBucketCocreatorOrCollAdminOrMod(parent, args, ctx);
      },
      async (_, { bucketId, approved }) =>
        prisma.bucket.update({
          where: { id: bucketId },
          data: {
            approvedAt: approved ? new Date() : null,
            ...(approved && { canceledAt: null }),
          },
        })
    ),
    allocate: async (_, { roundMemberId, amount, type }, { user }) => {
      const targetRoundMember = await prisma.roundMember.findUnique({
        where: { id: roundMemberId },
      });

      const currentCollMember = await prisma.roundMember.findUnique({
        where: {
          userId_roundId: {
            userId: user.id,
            roundId: targetRoundMember.roundId,
          },
        },
      });

      if (!currentCollMember?.isAdmin)
        throw new Error("You are not admin for this round");

      await allocateToMember({
        member: targetRoundMember,
        roundId: targetRoundMember.roundId,
        amount,
        type,
        allocatedBy: currentCollMember.id,
      });

      return targetRoundMember;
    },
    bulkAllocate: combineResolvers(
      isCollOrGroupAdmin,
      async (_, { roundId, amount, type }, { user }) => {
        const roundMembers = await prisma.roundMember.findMany({
          where: {
            roundId: roundId,
            isApproved: true,
          },
        });
        //here
        const currentCollMember = await prisma.roundMember.findUnique({
          where: {
            userId_roundId: {
              userId: user.id,
              roundId: roundId,
            },
          },
        });

        for (const member of roundMembers) {
          await allocateToMember({
            member,
            roundId: roundId,
            amount,
            type,
            allocatedBy: currentCollMember.id,
          });
        }

        return roundMembers;
      }
    ),
    contribute: async (
      _,
      { roundId, bucketId, amount },
      { user, eventHub }
    ) => {
      const roundMember = await getRoundMember({
        roundId,
        userId: user.id,
        include: { round: true },
      });

      const { round } = roundMember;

      if (amount <= 0) throw new Error("Value needs to be more than zero");

      // Check that granting is open
      const now = dayjs();
      const grantingHasOpened = round.grantingOpens
        ? dayjs(round.grantingOpens).isBefore(now)
        : true;
      const grantingHasClosed = round.grantingCloses
        ? dayjs(round.grantingCloses).isBefore(now)
        : false;
      const grantingIsOpen = grantingHasOpened && !grantingHasClosed;
      if (!grantingIsOpen) throw new Error("Funding is not open");

      let bucket = await prisma.bucket.findUnique({ where: { id: bucketId } });

      if (bucket.roundId !== roundId) throw new Error("Bucket not in round");

      if (!bucket.approvedAt)
        throw new Error("Bucket is not approved for funding");

      if (bucket.canceledAt)
        throw new Error("Funding has been canceled for bucket");

      if (bucket.fundedAt) throw new Error("Bucket has been funded");

      if (bucket.completedAt) throw new Error("Bucket is already completed");

      // Check that the max goal of the bucket is not exceeded
      const {
        _sum: { amount: contributionsForBucket },
      } = await prisma.contribution.aggregate({
        where: { bucketId: bucket.id },
        _sum: { amount: true },
      });

      const budgetItems = await prisma.budgetItem.findMany({
        where: { bucketId: bucket.id, type: "EXPENSE" },
      });

      const maxGoal = budgetItems.reduce(
        (acc, item) => acc + (item.max ? item.max : item.min),
        0
      );

      if (contributionsForBucket + amount > maxGoal)
        throw new Error("You can't overfund this bucket.");

      // mark bucket as funded if it has reached its max goal
      if (contributionsForBucket + amount === maxGoal) {
        bucket = await prisma.bucket.update({
          where: { id: bucketId },
          data: { fundedAt: new Date() },
        });
      }

      // Check that it is not more than is allowed per bucket (if this number is set)
      const {
        _sum: { amount: contributionsFromUserToThisBucket },
      } = await prisma.contribution.aggregate({
        where: {
          bucketId: bucket.id,
          roundMemberId: roundMember.id,
        },
        _sum: { amount: true },
      });

      if (
        round.maxAmountToBucketPerUser &&
        amount + contributionsFromUserToThisBucket >
          round.maxAmountToBucketPerUser
      ) {
        throw new Error(
          `You can give a maximum of ${round.maxAmountToBucketPerUser / 100} ${
            round.currency
          } to one bucket`
        );
      }

      // Check that user has not spent more tokens than he has
      const {
        _sum: { amount: contributionsFromUser },
      } = await prisma.contribution.aggregate({
        where: {
          roundMemberId: roundMember.id,
        },
        _sum: { amount: true },
      });

      const {
        _sum: { amount: allocationsForUser },
      } = await prisma.allocation.aggregate({
        where: {
          roundMemberId: roundMember.id,
        },
        _sum: { amount: true },
      });

      if (contributionsFromUser + amount > allocationsForUser)
        throw new Error("You are trying to spend more than what you have.");

      await prisma.contribution.create({
        data: {
          roundId,
          roundMemberId: roundMember.id,
          amount,
          bucketId: bucket.id,
          amountBefore: contributionsForBucket || 0,
        },
      });

      await prisma.transaction.create({
        data: {
          roundMemberId: roundMember.id,
          amount,
          toAccountId: bucket.statusAccountId,
          fromAccountId: roundMember.statusAccountId,
          roundId,
        },
      });

      await eventHub.publish("contribute-to-bucket", {
        round,
        bucket,
        contributingUser: user,
        amount,
      });

      return bucket;
    },
    markAsCompleted: combineResolvers(
      isCollModOrAdmin,
      async (_, { bucketId }) =>
        prisma.bucket.update({
          where: { id: bucketId },
          data: { completedAt: new Date() },
        })
    ),
    acceptFunding: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (_, { bucketId }) => {
        const {
          _sum: { amount: contributionsForBucket },
        } = await prisma.contribution.aggregate({
          where: { bucketId },
          _sum: { amount: true },
        });

        const {
          _sum: { min: minExpenses },
        } = await prisma.budgetItem.aggregate({
          where: { bucketId, type: "EXPENSE" },
          _sum: { min: true },
        });

        const {
          _sum: { min: minIncome },
        } = await prisma.budgetItem.aggregate({
          where: { bucketId, type: "INCOME" },
          _sum: { min: true },
        });

        const minGoal = minIncome - minExpenses;

        if (contributionsForBucket < minGoal)
          throw new Error("Bucket has not reached its minimum goal yet.");

        return prisma.bucket.update({
          where: { id: bucketId },
          data: { fundedAt: new Date() },
        });
      }
    ),
    cancelFunding: combineResolvers(
      isBucketCocreatorOrCollAdminOrMod,
      async (_, { bucketId }, { eventHub }) => {
        const bucket = await prisma.bucket.findUnique({
          where: { id: bucketId },
          include: {
            cocreators: true,
            round: { include: { group: true } },
            Contributions: {
              include: {
                roundMember: {
                  include: { user: { include: { emailSettings: true } } },
                },
              },
            },
          },
        });

        if (bucket.completedAt)
          throw new Error(
            "This bucket has already been marked completed, can't cancel funding."
          );

        const updated = await prisma.bucket.update({
          where: { id: bucketId },
          data: {
            fundedAt: null,
            approvedAt: null,
            canceledAt: new Date(),
            Contributions: { deleteMany: {} },
            statusAccount: {
              update: { incomingTransactions: { deleteMany: {} } },
            },
          },
        });

        await eventHub.publish("cancel-funding", {
          bucket,
        });

        return updated;
      }
    ),
    updateGrantingSettings: combineResolvers(
      isCollOrGroupAdmin,
      async (
        parent,
        {
          roundId,
          currency,
          maxAmountToBucketPerUser,
          bucketCreationCloses,
          grantingOpens,
          grantingCloses,
          allowStretchGoals,
          requireBucketApproval,
          directFundingEnabled,
          directFundingTerms,
        }
      ) => {
        const round = await prisma.round.findUnique({
          where: { id: roundId },
        });
        const grantingHasOpened = dayjs(round.grantingOpens).isBefore(dayjs());

        if (currency && grantingHasOpened) {
          throw new Error(
            "You can't change currency after funding has started"
          );
        }

        if (directFundingEnabled && !(await stripeIsConnected({ round }))) {
          throw new Error("You need to connect this round to Stripe first");
        }

        return prisma.round.update({
          where: { id: roundId },
          data: {
            currency,
            maxAmountToBucketPerUser,
            bucketCreationCloses,
            grantingOpens,
            grantingCloses,
            allowStretchGoals,
            requireBucketApproval,
            directFundingEnabled,
            directFundingTerms,
          },
        });
      }
    ),
    acceptInvitation: async (parent, { roundId }, { user }) => {
      if (!user) throw new Error("You need to be logged in.");

      const member = await getRoundMember({
        roundId,
        userId: user.id,
      });

      if (!member) {
        throw new Error("You are not a participant in this round");
      }

      if (member.hasJoined) {
        throw new Error("Invitation not pending");
      }

      return prisma.roundMember.update({
        where: { id: member.id },
        data: {
          hasJoined: true,
        },
      });
    },
    joinRound: async (parent, { roundId }, { user }) => {
      if (!user) throw new Error("You need to be logged in.");

      const currentGroupMember = await prisma.groupMember.findFirst({
        where: {
          userId: user.id,
          group: { rounds: { some: { id: roundId } } },
        },
      });

      const round = await prisma.round.findUnique({
        where: { id: roundId },
      });

      if (
        !currentGroupMember?.isAdmin &&
        round.registrationPolicy === "INVITE_ONLY"
      )
        throw new Error("This round is invite only");

      const isApproved =
        currentGroupMember?.isAdmin || round.registrationPolicy === "OPEN";

      const roundMember = await prisma.roundMember.upsert({
        where: { userId_roundId: { userId: user.id, roundId } },
        create: {
          round: { connect: { id: roundId } },
          user: { connect: { id: user.id } },
          isApproved,
          statusAccount: { create: {} },
          incomingAccount: { create: {} },
          outgoingAccount: { create: {} },
        },
        update: { isApproved, hasJoined: true, isRemoved: false },
      });

      if (!isApproved) {
        await emailService.roundJoinRequest({
          round,
          roundMember,
        });
      }

      return roundMember;
    },
    setEmailSetting: async (parent, { settingKey, value }, { user }) => {
      if (!user) throw "You need to be logged in";

      await prisma.emailSettings.upsert({
        where: { userId: user.id },
        create: { userId: user.id, [settingKey]: value },
        update: { [settingKey]: value },
      });

      return prisma.user.findUnique({ where: { id: user.id } });
    },
  },
  RoundMember: {
    round: async (member) => {
      return await prisma.round.findUnique({
        where: { id: member.roundId },
      });
    },
    user: async (member) =>
      prisma.user.findUnique({
        where: { id: member.userId },
      }),
    balance: async (member) => {
      return roundMemberBalance(member);
    },
    email: async (member, _, { user }) => {
      if (!user) return null;
      const currentCollMember = await prisma.roundMember.findUnique({
        where: {
          userId_roundId: {
            userId: user.id,
            roundId: member.roundId,
          },
        },
      });

      if (!(currentCollMember?.isAdmin || currentCollMember.id == member.id))
        return null;

      const u = await prisma.user.findFirst({
        where: {
          collMemberships: {
            some: { id: member.id },
          },
        },
      });
      return u.email;
    },
    name: async (member, _, { user }) => {
      if (!user) return null;
      const currentCollMember = await prisma.roundMember.findUnique({
        where: {
          userId_roundId: {
            userId: user.id,
            roundId: member.roundId,
          },
        },
      });

      if (!(currentCollMember?.isAdmin || currentCollMember.id == member.id))
        return null;

      const u = await prisma.user.findFirst({
        where: {
          collMemberships: {
            some: { id: member.id },
          },
        },
      });
      return u.name;
    },
  },
  GroupMember: {
    hasDiscourseApiKey: (groupMember) => !!groupMember.discourseApiKey,
    user: async (groupMember) => {
      return await prisma.user.findUnique({
        where: { id: groupMember.userId },
      });
    },
    email: async (member, _, { user }) => {
      if (!user) return null;
      const currentGroupMember = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: member.groupId,
            userId: user.id,
          },
        },
      });

      if (!(currentGroupMember?.isAdmin || currentGroupMember.id == member.id))
        return null;

      const u = await prisma.user.findFirst({
        where: {
          groupMemberships: {
            some: { id: member.id },
          },
        },
      });
      return u.email;
    },
    name: async (member, _, { user }) => {
      if (!user) return null;
      const currentGroupMember = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: member.groupId,
            userId: user.id,
          },
        },
      });

      if (!(currentGroupMember?.isAdmin || currentGroupMember.id == member.id))
        return null;

      const u = await prisma.user.findFirst({
        where: {
          groupMemberships: {
            some: { id: member.id },
          },
        },
      });
      return u.name;
    },
    group: async (groupMember) =>
      prisma.group.findUnique({
        where: { id: groupMember.groupId },
      }),
  },
  User: {
    currentGroupMember: async (parent, { groupSlug }, { user }) => {
      if (user?.id !== parent.id) return null;
      if (!groupSlug) return null;
      if (process.env.SINGLE_GROUP_MODE !== "true" && groupSlug == "c")
        return null;

      return prisma.groupMember.findFirst({
        where: { group: { slug: groupSlug }, userId: user.id },
      });
    },
    currentCollMember: async (parent, { groupSlug, roundSlug }, { user }) => {
      if (user?.id !== parent.id) return null;
      if (!roundSlug) return null;
      return prisma.roundMember.findFirst({
        where: {
          round: {
            slug: roundSlug,
            group: { slug: groupSlug },
          },
          userId: user.id,
        },
      });
    },
    groupMemberships: async (user) =>
      prisma.groupMember.findMany({ where: { userId: user.id } }),
    roundMemberships: async (user) =>
      prisma.roundMember.findMany({
        where: { userId: user.id, round: { isNot: { deleted: true } } },
      }),
    isRootAdmin: () => false, //TODO: add field in prisma
    avatar: () => null, //TODO: add avatars
    email: (parent, _, { user }) => {
      if (!user) return null;
      if (parent.id !== user.id) return null;
      if (parent.email) return parent.email;
    },
    // name: async (parent, _, { user }) => {
    //   if (!user) return null;
    //   if (parent.id !== user.id) return null;
    //   if (parent.name) return parent.name;
    //   // we end up here when requesting your own name but it's missing on the parent
    //   return (
    //     await prisma.user.findUnique({
    //       where: { id: parent.id },
    //       select: { name: true },
    //     })
    //   ).name;
    // },
    username: async (parent) => {
      if (!parent.username && parent.id) {
        return (
          await prisma.user.findUnique({
            where: { id: parent.id },
            select: { username: true },
          })
        ).username;
      }
      return parent.username;
    },
    emailSettings: async (parent, args, { user }) => {
      if (user?.id !== parent.id) return null;

      return prisma.emailSettings.upsert({
        where: { userId: parent.id },
        create: { userId: parent.id },
        update: {},
      });
    },
  },
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
    group: async (round) => {
      if (round.singleRound) return null;
      return prisma.group.findUnique({
        where: { id: round.groupId },
      });
    },
    bucketStatusCount: async (round) => {
      return {
        PENDING_APPROVAL: await prisma.bucket.count({
          where: {
            roundId: round.id,
            ...statusTypeToQuery("PENDING_APPROVAL"),
          },
        }),
        OPEN_FOR_FUNDING: await prisma.bucket.count({
          where: {
            roundId: round.id,
            ...statusTypeToQuery("OPEN_FOR_FUNDING"),
          },
        }),
        FUNDED: await prisma.bucket.count({
          where: {
            roundId: round.id,
            ...statusTypeToQuery("FUNDED"),
          },
        }),
        CANCELED: await prisma.bucket.count({
          where: {
            roundId: round.id,
            ...statusTypeToQuery("CANCELED"),
          },
        }),
        COMPLETED: await prisma.bucket.count({
          where: {
            roundId: round.id,
            ...statusTypeToQuery("COMPLETED"),
          },
        }),
      };
    },
  },
  Bucket: {
    cocreators: async (bucket) => {
      // const { cocreators } = await prisma.bucket.findUnique({
      //   where: { id: bucket.id },
      //   include: { cocreators: true },
      // });

      const cocreators = await prisma.roundMember.findMany({
        where: { buckets: { some: { id: bucket.id } } },
      });
      return cocreators;
    },
    round: async (bucket) => {
      return prisma.round.findUnique({
        where: { id: bucket.roundId },
      });
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

      return prisma.comment.count({ where: { bucketId: bucket.id } });
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
      const funders = await prisma.contribution.groupBy({
        where: { bucketId: bucket.id },
        by: ["roundMemberId"],
      });
      return funders.length;
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
      prisma.image.findMany({ where: { bucketId: bucket.id } }),
    customFields: async (bucket) =>
      prisma.fieldValue.findMany({ where: { bucketId: bucket.id } }),
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

      const field = await prisma.field.findUnique({
        where: { id: fieldValue.fieldId },
      });

      return field;
    },
  },
};

export default resolvers;
