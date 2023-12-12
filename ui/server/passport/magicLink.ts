import MagicLoginStrategy from "passport-magic-login";
import AppError from "server/utils/AppError";
import emailService from "../services/EmailService/email.service";
import { createOrGetUser } from "./helpers";
import prisma from "server/prisma";

if (!process.env.MAGIC_LINK_SECRET)
  throw new Error(`Add MAGIC_LINK_SECRET environment variable`);

const magicLink = new MagicLoginStrategy({
  secret: process.env.MAGIC_LINK_SECRET,
  callbackUrl: "/api/auth/magiclink/callback",
  sendMagicLink: async (destination, href, code, req) => {
    const user = await prisma.user.findUnique({
      where: { email: destination },
    });
    if (user) {
      await prisma.user.update({
        where: { email: destination },
        data: { magiclinkCode: code },
      });
    }
    await emailService.loginMagicLink({ destination, href, code, req });
  },
  verify: (payload, callback) => {
    if (payload === false) {
      return callback(new AppError("Invalid Token", 400));
    }

    const email = payload.destination.toLowerCase().trim();

    createOrGetUser({ email })
      .then((user) => {
        callback(null, { ...user, redirect: payload.redirect });
      })
      .catch((err) => callback(err));
  },
});

export default magicLink;
