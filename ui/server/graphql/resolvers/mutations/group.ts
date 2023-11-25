import prisma from "../../../prisma";
import { combineResolvers } from "graphql-resolvers";
import { isGroupAdmin, isRootAdmin } from "../auth";
import slugify from "utils/slugify";
import { sign } from "server/utils/jwt";
import { appLink } from "utils/internalLinks";
import { getGroup } from "server/controller";
import discourse from "../../../lib/discourse";
import emailService from "server/services/EmailService/email.service";
import isGroupSubscriptionActive from "../helpers/isGroupSubscriptionActive";
import { moveRoundToGroup as moveRoundToGroupHelper } from "../helpers/group";

export const createGroupInvitationLink = combineResolvers(
  isGroupAdmin,
  async (_, { groupId }) => {
    const inviteNonce = Date.now();
    const round = await prisma.group.update({
      where: { id: groupId },
      data: { inviteNonce },
    });
    return {
      link: round.inviteNonce,
    };
  }
);

export const deleteGroupInvitationLink = combineResolvers(
  isGroupAdmin,
  async (_, { groupId }) => {
    await prisma.group.update({
      where: { id: groupId },
      data: { inviteNonce: null },
    });
    return {
      link: null,
    };
  }
);

export const createGroup = async (
  parent,
  { name, slug, logo },
  { user, eventHub }
) => {
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
};

export const editGroup = combineResolvers(
  isGroupAdmin,
  async (
    parent,
    { groupId, name, info, slug, registrationPolicy, logo, visibility },
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
        registrationPolicy,
        visibility,
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
);

export const setTodosFinished = combineResolvers(
  isGroupAdmin,
  async (parent, { groupId }) => {
    const group = await prisma.group.update({
      where: { id: groupId },
      data: { finishedTodos: true },
    });
    return group;
  }
);

export const joinGroup = async (_, { groupId }, { user }) => {
  if (!user) throw new Error("You need to be logged in.");

  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (group.registrationPolicy === "INVITE_ONLY")
    throw new Error("This group is invite only");

  return await prisma.groupMember.create({
    data: {
      userId: user.id,
      groupId: groupId,
      isApproved: group.registrationPolicy === "OPEN",
    },
  });
};

export const inviteGroupMembers = combineResolvers(
  isGroupAdmin,
  async (_, { groupId, emails: emailsString }, { user: currentUser }) => {
    const emails: string[] = emailsString.split(",");

    if (emails.length > 1000)
      throw new Error("You can only invite 1000 people at a time");

    await isGroupSubscriptionActive({ groupId });

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
);

export const updateGroupMember = combineResolvers(
  isGroupAdmin,
  async (parent, { groupId, memberId, isAdmin, isApproved }, { user }) => {
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
      if (typeof isAdmin !== "undefined") groupMember.isAdmin = isAdmin;
    }

    if (typeof isApproved !== "undefined") groupMember.isApproved = isApproved;

    return await prisma.groupMember.update({
      where: { id: groupMember.id },
      data: { ...groupMember },
    });
  }
);

export const deleteGroupMember = combineResolvers(
  isGroupAdmin,
  async (parent, { groupId, groupMemberId }) => {
    return prisma.groupMember.delete({
      where: { id: groupMemberId },
    });
  }
);

export const changeGroupFreeStatus = async (
  _,
  { groupId, freeStatus },
  { ss }
) => {
  if (!ss) {
    throw new Error("Only superadmins can perform this action");
  }
  return prisma.group.update({
    where: { id: groupId },
    data: {
      isFree: freeStatus,
    },
  });
};

export const moveRoundToGroup = async (
  _,
  { groupId, roundId },
  { user, ss }
) => {
  return moveRoundToGroupHelper({ groupId, roundId });
};
