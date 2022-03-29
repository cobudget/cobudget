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
      if (!req.session.passport?.user) {
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
      const interval = 6 * 60 * 60 * 1000; // 6 hours

      if (
        req.session.lastSSOLoggedInCheck &&
        req.session.lastSSOLoggedInCheck + interval < Number(new Date())
      ) {
        fetch(
          `https://graph.facebook.com/debug_token?input_token=${req.session.accessToken}&access_token=${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`,
          {
            method: "GET",
            //body: JSON.stringify({
            //  redirect,
            //  destination: email,
            //  rememberMe: rememberMeOne,
            //}),
            //headers: { "Content-Type": "application/json" },
          }
        )
          .then((res) => res.json())
          .then((json) => {
            console.log("debug_token result:", json);
            //debug_token result: {
            //  data: {
            //    app_id: '123',
            //    type: 'USER',
            //    application: 'Plato Project - Test1',
            //    data_access_expires_at: 1656352784,
            //    expires_at: 1653743336,
            //    is_valid: true,
            //    issued_at: 1648559336,
            //    scopes: [ 'email', 'public_profile' ],
            //    user_id: '456'
            //  }
            //}
            next();
          })
          .catch((error) => next(error));
      }

      next();
    })
    .use(passport.initialize())
    .use(passport.session());
}

export default handler;
