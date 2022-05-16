import { appLink } from "utils/internalLinks";
import handler from "server/api-handler";
import { getRoundMember } from "server/graphql/resolvers/helpers";
import prisma from "server/prisma";
import stripe from "server/utils/stripe";

export default handler().get(async (req, res) => {
  if (typeof req.query?.bucketId !== "string") throw new Error("Bad bucketId");
  if (typeof req.query?.contribution !== "string")
    throw new Error("Bad contribution");
  if (typeof req.query?.tipAmount !== "string")
    throw new Error("Bad tipAmount");
  const bucketId = req.query?.bucketId;
  const contribution = Number(req.query?.contribution);
  const tipAmount = Number(req.query?.tipAmount);

  const bucket = await prisma.bucket.findUnique({
    where: { id: bucketId },
    include: { round: true },
  });

  if (!bucket.directFundingEnabled || !bucket.round.directFundingEnabled) {
    throw new Error("Direct funding not enabled for this bucket and/or round");
  }

  const isExchange = bucket.directFundingType === "EXCHANGE";

  if (
    !Number.isSafeInteger(contribution) ||
    contribution <= 0 ||
    (isExchange && contribution < bucket.exchangeMinimumContribution)
  ) {
    throw new Error("Invalid or too low contribution");
  }

  if (
    !Number.isSafeInteger(tipAmount) ||
    tipAmount < 0 ||
    tipAmount > contribution
  ) {
    throw new Error("Invalid, too low, or too high tip amount");
  }

  // throws if not a round member
  await getRoundMember({ bucketId, userId: req.user.id });

  //res.redirect(accountLink.url);
});
