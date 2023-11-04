import stripe from "server/stripe";
import prisma from "../../../prisma";

export const info = (group) => {
  return group.info && group.info.length
    ? group.info
    : `# Welcome to ${group.name}`;
};
export const rounds = async (group, args, { user }) => {
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
};

export const discourseUrl = async (group) => {
  const discourseConfig = await prisma.discourseConfig.findFirst({
    where: { groupId: group.id },
  });
  return discourseConfig?.url ?? null;
};

export const subscriptionStatus = async (group) => {
  if (group.stripeSubscriptionId && group.slug !== "c") {
    const subscription = await stripe.subscriptions.retrieve(
      group.stripeSubscriptionId
    );
    return {
      isActive: group.isFree || subscription.status === "active",
    };
  } else {
    return null;
  }
};
