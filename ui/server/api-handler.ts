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

      if (err.statusCode === 400 && err.message === "Invalid Token") {
        res.redirect("/login?err=INVALID_TOKEN");
      }
      if (
        err.statusCode === 403 &&
        err.message === "Email scope not provided on Facebook login"
      ) {
        res.redirect("/login?err=FACEBOOK_NO_EMAIL");
      }

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
      // if we're not logged in yet
      if (!req.session?.passport?.user) {
        // the rememberMe field being set means we're in the process of logging in
        if (
          req.body?.rememberMe === true ||
          req.query?.remember_me === "true"
        ) {
          req.session.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        } else if (
          req.body?.rememberMe === false ||
          req.query?.remember_me === "false"
        ) {
          req.session.maxAge = 12 * 60 * 60 * 1000; // 12 hours
        }
      }

      req.sessionOptions.maxAge =
        req.session.maxAge || req.sessionOptions.maxAge;
      next();
    })
    .use(function (req, res, next) {
      const interval = 1 * 60 * 60 * 1000; // 1 hour

      if (
        req.session.lastSSOValidCheck &&
        req.session.lastSSOValidCheck + interval < Number(new Date())
      ) {
        fetch(
          `https://graph.facebook.com/debug_token?input_token=${req.session.accessToken}&access_token=${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`,
          {
            method: "GET",
          }
        )
          .then((res) => res.json())
          .then((json) => {
            // is_valid turns false if the user has revoked permissions to our app
            // according to facebook we have to check this at least every 24 hours
            // https://developers.facebook.com/devpolicy/#login
            if (json?.data?.is_valid !== true) {
              req.logout?.();
              req.session = null;
            } else {
              req.session.lastSSOValidCheck = Number(new Date());
            }
            next();
          })
          .catch((error) => next(error));
      } else {
        next();
      }
    })
    .use(passport.initialize())
    .use(passport.session());
}

export default handler;
