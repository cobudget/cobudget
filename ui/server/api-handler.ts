import cookieSession from "cookie-session";
import { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import { error } from "next/dist/build/output/log";
import passport from "./passport";

interface Request extends NextApiRequest {
  // Passport adds these to the request object
  logout: () => void;
  user?: Express.User;
  // added by cookieSession
  sessionOptions: any;
  session: any;
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
        sameSite: "lax",
        secure: false,
        secureProxy:
          process.env.NODE_ENV !== "development" && !process.env.INSECURE_AUTH,
        signed:
          process.env.NODE_ENV !== "development" && !process.env.INSECURE_AUTH,
      })
    )
    .use(function (req, res, next) {
      if (!req.session.maxAge) {
        if (req.body?.rememberMe) {
          req.session.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        } else {
          req.session.maxAge = 12 * 60 * 60 * 1000; // 12 hours
        }
      }

      req.sessionOptions.maxAge =
        req.session.maxAge || req.sessionOptions.maxAge;
      next();
    })
    .use(passport.initialize())
    .use(passport.session());
}

export default handler;
