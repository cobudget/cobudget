import prisma from "../../../prisma";
import { combineResolvers } from "graphql-resolvers";
import { isBucketCocreatorOrCollAdminOrMod, isGroupAdmin } from "../auth";
import slugify from "utils/slugify";
import {
  getCollective,
  getRoundMember,
  isCollAdmin,
  isCollOrGroupAdmin,
  roundMemberBalance,
  stripeIsConnected,
} from "../helpers";
import { verify } from "server/utils/jwt";
import emailService from "server/services/EmailService/email.service";
import {
  allocateToMember,
  bulkAllocate as bulkAllocateController,
} from "server/controller";
import dayjs from "dayjs";

export const createRound = async (
  parent,
  { groupId, slug, title, currency, registrationPolicy },
  { user, ss }
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
    await isGroupAdmin(null, { groupId }, { user, ss });
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
};

export const editRound = combineResolvers(
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
      ocCollectiveSlug,
    }
  ) => {
    let collectiveId;
    if (ocCollectiveSlug) {
      const collective = await getCollective({ slug: ocCollectiveSlug });
      if (collective) {
        collectiveId = collective.id;
      } else {
        // If collective slug is provided and collective not found
        // throw error
        throw new Error("Collective not found");
      }
    } else if (ocCollectiveSlug === "") {
      // An empty string means the user wants to remove
      // collective
      collectiveId = null;
    }

    return prisma.round.update({
      where: { id: roundId },
      data: {
        ...(slug && { slug: slugify(slug) }),
        openCollectiveId: collectiveId,
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
);

export const createInvitationLink = async (
  parent,
  { roundId },
  { user, ss }
) => {
  const isAdmin =
    (await !!user) &&
    isCollAdmin({
      userId: user?.id,
      roundId,
      ss,
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
};

export const deleteInvitationLink = async (
  parent,
  { roundId },
  { user, ss }
) => {
  const isAdmin =
    (await !!user) &&
    isCollAdmin({
      userId: user?.id,
      roundId,
      ss,
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
};

export const joinInvitationLink = async (parent, { token }, { user }) => {
  if (!user) {
    throw new Error("You need to be logged in to join the group");
  }

  const payload = verify(token);

  if (!payload) {
    throw new Error("Invalid invitation link");
  }

  const { roundId, groupId, nonce: inviteNonce } = payload;

  if (roundId) {
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

    return { id: roundMember.id, roundId: roundMember.roundId };
  } else {
    const group = await prisma.group.findFirst({
      where: { id: groupId, inviteNonce },
    });

    if (!group) {
      throw new Error("Group invitation link expired");
    }

    const groupMember = await prisma.groupMember.create({
      data: { userId: user.id, groupId: groupId },
    });

    return { id: groupMember.id, groupId: groupMember.groupId };
  }
};

export const deleteRound = combineResolvers(
  isCollOrGroupAdmin,
  async (parent, { roundId }) =>
    prisma.round.update({
      where: { id: roundId },
      data: { deleted: true },
    })
);

export const addGuideline = combineResolvers(
  isCollOrGroupAdmin,
  async (parent, { roundId, guideline: { title, description } }) => {
    const guidelines = await prisma.guideline.findMany({
      where: { roundId: roundId },
    });

    const position =
      guidelines.map((g) => g.position).reduce((a, b) => Math.max(a, b), 1000) +
      1;

    const guideline = await prisma.guideline.create({
      data: { roundId: roundId, title, description, position },
      include: { round: true },
    });
    return guideline.round;
  }
);

export const editGuideline = combineResolvers(
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
);

export const setGuidelinePosition = combineResolvers(
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
);

export const deleteGuideline = combineResolvers(
  isCollOrGroupAdmin,
  async (parent, { roundId, guidelineId }) =>
    prisma.round.update({
      where: { id: roundId },
      data: { guidelines: { delete: { id: guidelineId } } },
    })
);

export const inviteRoundMembers = combineResolvers(
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
);

export const updateMember = combineResolvers(
  isCollOrGroupAdmin,
  async (parent, { roundId, memberId, isApproved, isAdmin, isModerator }) => {
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
);

export const deleteMember = combineResolvers(
  isCollOrGroupAdmin,
  async (parent, { roundId, memberId }) => {
    const roundMember = await prisma.roundMember.findUnique({
      where: { id: memberId },
    });
    if (!roundMember)
      throw new Error("This member does not exist in this collection");

    if ((await roundMemberBalance(roundMember)) !== 0) {
      throw new Error("You can only remove a round participant with 0 balance");
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
);

export const allocate = async (
  _,
  { roundMemberId, amount, type },
  { user }
) => {
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

  await prisma.$transaction(async (prisma) => {
    await allocateToMember({
      member: targetRoundMember,
      roundId: targetRoundMember.roundId,
      amount,
      type,
      allocatedBy: currentCollMember.id,
      prisma: prisma as any,
    });
  });

  return targetRoundMember;
};

export const bulkAllocate = combineResolvers(
  isCollOrGroupAdmin,
  async (_, { roundId, amount, type }, { user }) => {
    const roundMembers = await prisma.roundMember.findMany({
      where: {
        roundId: roundId,
        isApproved: true,
      },
    });
    const currentCollMember = await prisma.roundMember.findUnique({
      where: {
        userId_roundId: {
          userId: user.id,
          roundId: roundId,
        },
      },
    });

    await bulkAllocateController({
      roundId,
      amount,
      type,
      allocatedBy: currentCollMember.id,
    });

    return roundMembers;
  }
);

export const updateGrantingSettings = combineResolvers(
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
      directFundingEnabled,
      directFundingTerms,
      canCocreatorStartFunding,
      canCocreatorEditOpenBuckets,
    }
  ) => {
    const round = await prisma.round.findUnique({
      where: { id: roundId },
    });
    const grantingHasOpened = dayjs(round.grantingOpens).isBefore(dayjs());

    if (currency && grantingHasOpened) {
      throw new Error("You can't change currency after funding has started");
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
        directFundingEnabled,
        directFundingTerms,
        canCocreatorStartFunding,
        canCocreatorEditOpenBuckets,
      },
    });
  }
);

export const acceptInvitation = async (parent, { roundId }, { user }) => {
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
};

export const joinRound = async (parent, { roundId }, { user }) => {
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
};

export const addCustomField = combineResolvers(
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
);

// Based on https://softwareengineering.stackexchange.com/a/195317/54663
export const setCustomFieldPosition = combineResolvers(
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
);

export const editCustomField = combineResolvers(
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
);

export const deleteCustomField = combineResolvers(
  isCollOrGroupAdmin,
  async (parent, { roundId, fieldId }) =>
    prisma.round.update({
      where: { id: roundId },
      data: { fields: { delete: { id: fieldId } } },
    })
);

export const editBucketCustomField = combineResolvers(
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
);
