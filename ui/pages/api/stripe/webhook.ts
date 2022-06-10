import getRawBody from "raw-body";
import handler from "server/api-handler";
import { allocateToMember, contribute } from "server/controller";
import prisma from "server/prisma";
import stripe from "server/utils/stripe";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler().post(async (req, res) => {
  const sig = req.headers["stripe-signature"];

  const rawBody = await getRawBody(req);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
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

    const stripeSessionId = session.id ?? missing();

    const {
      roundMemberId = missing(),
      roundId = missing(),
      bucketId = missing(),
    } = session.metadata;

    const contribution = session.metadata.contribution
      ? Number(session.metadata.contribution)
      : missing();

    const roundMember = await prisma.roundMember.findUnique({
      where: { id: roundMemberId },
      include: {
        user: true,
      },
    });

    await prisma.$transaction(async (prisma) => {
      await allocateToMember({
        roundId,
        allocatedBy: roundMemberId,
        amount: contribution,
        member: roundMember,
        type: "ADD",
        stripeSessionId,
        prisma,
      });

      await contribute({
        roundId,
        bucketId,
        amount: contribution,
        user: roundMember.user,
        stripeSessionId,
        prisma,
      });
    });
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).end();
});
