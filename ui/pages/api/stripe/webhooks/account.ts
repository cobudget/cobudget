import getRawBody from "raw-body";
import handler from "server/api-handler";
import prisma from "server/prisma";
import stripe from "server/stripe";
import slugify from "server/utils/slugify";

export const config = {
  api: {
    bodyParser: false,
  },
};

const secondsToMsDate = (seconds: number) => new Date(seconds * 1000);

export default handler().post(async (req, res) => {
  const sig = req.headers["stripe-signature"];

  const rawBody = await getRawBody(req);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_ACCOUNT_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const missing = () => {
      throw new Error(`Missing metadata in session ${session.id}`);
    };

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription
    );

    const {
      userId = missing(),
      groupName = missing(),
      groupSlug = missing(),
    } = session.metadata;

    const { roundId } = session.metadata;

    console.log("webhook: subscription", subscription);

    console.log({ subscription, userId });

    let group;

    try {
      group = await prisma.group.create({
        data: {
          name: groupName,
          slug: slugify(groupSlug),
          stripeCurrentPeriodEnd: secondsToMsDate(
            subscription.current_period_end
          ),
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: session.customer,
          stripePriceId: subscription.items.data[0].price.id,
          groupMembers: { create: { userId, isAdmin: true } },
        },
      });
    } catch (error) {
      console.log(error);

      // try again with randomness added to slug
      group = await prisma.group.create({
        data: {
          name: groupName,
          slug: slugify(
            groupSlug + "-" + (Math.random() + 1).toString(36).substring(7)
          ),
          stripeCurrentPeriodEnd: secondsToMsDate(
            subscription.current_period_end
          ),
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: session.customer,
          stripePriceId: subscription.items.data[0].price.id,
          groupMembers: { create: { userId, isAdmin: true } },
        },
      });
    }

    if (roundId) {
      const round = await prisma.round.findFirst({
        where: { id: roundId },
        select: { group: { select: { slug: true } } },
      });
      // Only upgrade round, if the round group is the root group
      if (round.group.slug === "c") {
        await prisma.round.update({
          where: { id: roundId },
          data: {
            groupId: group.id,
            singleRound: false,
          },
        });

        const roundMembers = await prisma.roundMember.findMany({
          where: { roundId, isAdmin: false },
        });
        await prisma.groupMember.createMany({
          data: roundMembers.map((member) => ({
            userId: member.userId,
            groupId: group.id,
          })),
        });
      }
    }
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).end();
});
