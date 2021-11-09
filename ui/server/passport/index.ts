import passport from "passport";
import magicLink from "./magicLink";
import prisma from "../prisma";

passport.use(magicLink);

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      id: string;
      email: string;
      provider: string;
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
