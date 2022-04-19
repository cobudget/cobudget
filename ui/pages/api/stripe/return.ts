import { appLink } from "utils/internalLinks";
import handler from "server/api-handler";
import prisma from "server/prisma";
import stripe from "server/utils/stripe";

export default handler().get(async (req, res) => {
  throw "hey!";
});
