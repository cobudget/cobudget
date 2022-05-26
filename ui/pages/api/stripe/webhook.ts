import getRawBody from "raw-body";
import { appLink } from "utils/internalLinks";
import handler from "server/api-handler";
import { isCollOrGroupAdmin } from "server/graphql/resolvers/helpers";
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
    const metadata = session.metadata;

    console.log("session", session);

    const roundMember = await prisma.roundMember.findUnique({
      where: { id: metadata.roundMemberId },
    });
    const bucket = await prisma.bucket.findUnique({
      where: { id: metadata.bucketId },
    });

    const missing = () => {
      throw new Error(`Missing metadata in session ${session.id}`);
    };

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount: metadata.contribution || missing(),
          roundMemberId: metadata.roundMemberId || missing(),
          roundId: metadata.roundId || missing(),
          fromAccountId: roundMember.incomingAccountId || missing(),
          toAccountId: bucket.statusAccountId || missing(),
          stripeSessionId: session.id || missing(),
        },
      }),
      //TODO: skapa också en Contribution med typ samma info. kanske också lägga till session id?
      //TODO: gör också en Allocation från användaren till sig själv. lägg till session id på den också
    ]);
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).end();
});
