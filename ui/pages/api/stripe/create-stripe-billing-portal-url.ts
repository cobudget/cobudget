import handler from "server/api-handler";
import prisma from "server/prisma";
import stripe from "server/stripe";
import { getRequestOrigin } from "server/get-request-origin";

export default handler().get(async (req, res) => {
  if (!req.user) throw new Error("You must be logged in");

  const groupId = req.query.groupId;
  // expect groupId to be a string
  if (typeof groupId !== "string")
    throw new Error("groupId missing or not a string");

  const origin = getRequestOrigin(req);
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group.stripeCustomerId) throw new Error("Group has no customer id");

  //check that user is admin of group
  const groupMember = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId: req.user.id,
    },
  });
  if (!groupMember.isAdmin)
    throw new Error("You need to be admin to access billing portal");

  const { url } = await stripe.billingPortal.sessions.create({
    customer: group.stripeCustomerId,
    return_url: `${origin}/${group.slug}/settings/billing`,
  });

  res.redirect(303, url);
});
