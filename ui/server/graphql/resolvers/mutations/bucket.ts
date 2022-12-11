import prisma from "../../../prisma";
import { combineResolvers } from "graphql-resolvers";
import {
  isBucketCocreatorOrCollAdminOrMod,
  isCollMember,
  isCollModOrAdmin,
} from "../auth";
import dayjs from "dayjs";
import { isAndGetCollMember, updateFundedPercentage } from "../helpers";
import subscribers from "../../../subscribers/discourse.subscriber";
import discourse from "server/lib/discourse";
import { contribute as contributeToBucket } from "server/controller";
const { groupHasDiscourse } = subscribers;

export const createBucket = combineResolvers(
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

    if (!bucketCreationIsOpen) throw new Error("Bucket creation is not open");

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
);

export const editBucket = combineResolvers(
  isBucketCocreatorOrCollAdminOrMod,
  async (
    parent,
    {
      bucketId,
      title,
      description,
      summary,
      images,
      budgetItems,
      directFundingEnabled,
      directFundingType,
      exchangeDescription,
      exchangeMinimumContribution,
      exchangeVat,
    },
    { user, eventHub }
  ) => {
    if (
      exchangeMinimumContribution !== undefined &&
      exchangeMinimumContribution < 0
    ) {
      throw new Error(
        "The minimum contribution requirement must be 0 or higher"
      );
    }
    if (
      exchangeVat !== undefined &&
      (exchangeVat < 0 || exchangeVat > 100 * 100)
    ) {
      throw new Error("VAT must be a percentage from 0 to 100");
    }

    let updated = await prisma.bucket.update({
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
        directFundingEnabled,
        directFundingType,
        exchangeDescription,
        exchangeMinimumContribution,
        exchangeVat,
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

    updated = await updateFundedPercentage(updated);

    return updated;
  }
);

export const createTag = combineResolvers(
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
);

export const addTag = combineResolvers(
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
);

// removes a tag from all buckets it's added to, and then deletes it
export const deleteTag = combineResolvers(
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
);

// removes a tag from a specific bucket
export const removeTag = combineResolvers(
  isBucketCocreatorOrCollAdminOrMod,
  async (_, { bucketId, tagId }) =>
    prisma.bucket.update({
      where: { id: bucketId },
      data: { tags: { disconnect: { id: tagId } } },
    })
);

export const deleteBucket = combineResolvers(
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
);

export const addCocreator = combineResolvers(
  isBucketCocreatorOrCollAdminOrMod,
  async (parent, { bucketId, memberId }) => {
    const roundMember = await prisma.roundMember.findFirst({
      where: {
        id: memberId,
      },
    });
    if (roundMember?.hasJoined) {
      return prisma.bucket.update({
        where: { id: bucketId },
        data: {
          cocreators: {
            connect: { id: memberId },
          },
        },
      });
    } else {
      throw new Error("The member have not joined the round");
    }
  }
);

export const removeCocreator = combineResolvers(
  isBucketCocreatorOrCollAdminOrMod,
  async (_, { bucketId, memberId }) =>
    prisma.bucket.update({
      where: { id: bucketId },
      data: { cocreators: { disconnect: { id: memberId } } },
    })
);

export const publishBucket = combineResolvers(
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
);

export const addComment = combineResolvers(
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
);

export const deleteComment = combineResolvers(
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
);

export const editComment = combineResolvers(
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
        currentGroupMember: currentCollMember.round.group?.groupMembers?.[0],
        currentCollMember,
        bucket: comment.bucket,
        comment,
      }
    );
    return discourse || prismaResult;
  }
);

export const raiseFlag = async (
  parent,
  { bucketId, guidelineId, comment },
  { user }
) => {
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
};

export const resolveFlag = async (
  parent,
  { bucketId, flagId, comment },
  { user }
) => {
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
};

export const allGoodFlag = async (parent, { bucketId }, { user }) => {
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
};

export const approveForGranting = combineResolvers(
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
);

export const markAsCompleted = combineResolvers(
  isCollModOrAdmin,
  async (_, { bucketId }) =>
    prisma.bucket.update({
      where: { id: bucketId },
      data: { completedAt: new Date() },
    })
);

export const acceptFunding = combineResolvers(
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
);

export const cancelFunding = combineResolvers(
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
);

export const contribute = async (
  _,
  { roundId, bucketId, amount },
  { user }
) => {
  return contributeToBucket({ roundId, bucketId, amount, user });
};
