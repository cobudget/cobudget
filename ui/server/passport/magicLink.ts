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
    const email = payload.destination.toLowerCase().trim();

    prisma.user
      .findUnique({ where: { email } })
      .then(async (olderUser) => {
        const newerUser = await prisma.user.upsert({
          create: {
            email,
            verifiedEmail: true,
          },
          update: {
            verifiedEmail: true,
          },
          where: {
            email,
          },
        });

        // the user can join the app in two ways:
        // 1. they go to the website and sign up
        // 2. they get an invite to an group/coll from someone (when invited,
        // their User object is also created). that invite just
        // links them to the group/coll . then the user signs up like in case 1.
        // In both cases they end up here where we can send their welcome mail
        // (note that they also end up here when simply signing in)

        if (olderUser?.verifiedEmail !== newerUser.verifiedEmail) {
          // if true then it's a new user
          await emailService.welcomeEmail({ newUser: newerUser });
        }

        callback(null, newerUser);
      })
      .catch((err) => callback(err));
  },
});

export default magicLink;
