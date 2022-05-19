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

    console.log("session", session);
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).end();
});
