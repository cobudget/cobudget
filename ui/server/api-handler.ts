import cookieSession from "cookie-session";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { error } from "next/dist/build/output/log";
import passport from "./passport";

interface Request extends NextApiRequest {
  // Passport adds these to the request object
  logout: () => void;
  user?: Express.User;
}

function handler() {
  if (!process.env.COOKIE_SECRET)
    throw new Error(`Add COOKIE_SECRET environment variable`);

  return nc<Request, NextApiResponse>({
    onError: (err, _, res) => {
      error(err);
      res.status(500).end(err.toString());
    },
  })
    .use(
      cookieSession({
        name: "session",
        keys: [process.env.COOKIE_SECRET],
        maxAge: 24 * 60 * 60 * 1000 * 30,
        //domain: ".localhost",
        sameSite: "lax",
        secure: false,
        secureProxy:
          process.env.NODE_ENV !== "development" && !process.env.INSECURE_AUTH,
        signed:
          process.env.NODE_ENV !== "development" && !process.env.INSECURE_AUTH,
      })
    )
    .use(passport.initialize())
    .use(passport.session());
}

export default handler;
