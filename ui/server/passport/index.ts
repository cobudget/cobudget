import passport from "passport";
import magicLink from "./magicLink";
import facebook from "./facebookStrategy";
import google from "./googleStrategy";
import prisma from "../prisma";

passport.use(magicLink);

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(facebook);
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(google);
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      id: string;
      email: string;
      // TODO: made this optional since we're not actually providing it on the user object. what was this added for?
      provider?: string;
      redirect?: string;
    }
  }
}

passport.serializeUser(async (u: Express.User, done) => {
  done(null, u.id);
});

passport.deserializeUser(async (id: string, done) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  done(null, user);
});

export default passport;
