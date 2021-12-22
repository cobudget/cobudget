import MagicLoginStrategy from "passport-magic-login";
import prisma from "../prisma";
import emailService from "../services/EmailService/email.service";

if (!process.env.MAGIC_LINK_SECRET)
  throw new Error(`Add MAGIC_LINK_SECRET environment variable`);

const magicLink = new MagicLoginStrategy({
  secret: process.env.MAGIC_LINK_SECRET,
  callbackUrl: "/api/auth/magiclink/callback",
  sendMagicLink: async (destination, href, code, req) => {
    await emailService.loginMagicLink({ destination, href, code, req });
  },
  verify: (payload, callback) => {
    prisma.user
      .upsert({
        create: {
          email: payload.destination.toLowerCase().trim(),
          verifiedEmail: true,
        },
        update: {
          verifiedEmail: true,
        },
        where: {
          email: payload.destination.toLowerCase().trim(),
        },
      })
      .then((user) => callback(null, user))
      .catch((err) => callback(err));
  },
});

export default magicLink;
