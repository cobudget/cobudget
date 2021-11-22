import MagicLoginStrategy from "passport-magic-login";
import { getRequestOrigin } from "../get-request-origin";
import { sendEmail } from "../send-email";
import prisma from "../prisma";

if (!process.env.MAGIC_LINK_SECRET)
  throw new Error(`Add MAGIC_LINK_SECRET environment variable`);

const magicLink = new MagicLoginStrategy({
  secret: process.env.MAGIC_LINK_SECRET,
  callbackUrl: "/api/auth/magiclink/callback",
  sendMagicLink: async (destination, href, code, req) => {
    const link = `${getRequestOrigin(req)}${href}`;

    await sendEmail({
      to: destination,
      subject: `Your login link`,
      text: `Click on this link to login: ${link}\n\nVerification code ${code}`,
    });
  },
  verify: (payload, callback) => {
    prisma.user
      .upsert({
        create: {
          email: payload.destination,
          verifiedEmail: true,
        },
        update: {
          verifiedEmail: true,
        },
        where: {
          email: payload.destination,
        },
      })
      .then((user) => callback(null, user))
      .catch((err) => callback(err));
  },
});

export default magicLink;
