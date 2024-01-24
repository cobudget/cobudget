import { GROUP_NOT_SUBSCRIBED } from "../../../../constants";
import prisma from "server/prisma";
import stripe from "server/stripe";

const isGroupSubscriptionActive = async ({
  group,
  groupId,
}: {
  group?: {
    slug: string;
    isFree: boolean;
    stripeSubscriptionId: null | string;
  };
  groupId?: string;
}) => {
  if (!group && !groupId) {
    throw new Error("Group or group id is required");
  }

  let groupToCheck: any = group;

  if (!groupToCheck) {
    groupToCheck = await prisma.group.findFirst({ where: { id: groupId } });
  }

  if (groupToCheck?.slug === "c" || groupToCheck?.isFree) {
    return;
  }

  if (!groupToCheck.stripeSubscriptionId) {
    throw new Error(GROUP_NOT_SUBSCRIBED);
  }

  const subscription = await stripe.subscriptions.retrieve(
    groupToCheck.stripeSubscriptionId
  );

  if (subscription.status !== "active") {
    throw new Error(GROUP_NOT_SUBSCRIBED);
  }
};

export const getIsGroupSubscriptionActive = async ({
  group,
  groupId,
}: {
  group?: {
    slug: string;
    isFree: boolean;
    stripeSubscriptionId: null | string;
  };
  groupId?: string;
}) => {
  try {
    await isGroupSubscriptionActive({ group, groupId });
    return true;
  } catch (err) {
    return false;
  }
};

export default isGroupSubscriptionActive;
