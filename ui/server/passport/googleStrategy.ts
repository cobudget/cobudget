import { Strategy } from "passport-google-oauth20";
import { appLink } from "utils/internalLinks";
import AppError from "server/utils/AppError";
import { createOrGetUser } from "./helpers";

const googleStrategy =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: appLink("/api/auth/google/callback"),
      scope: ["email"],
    },
    function (accessToken, refreshToken, profile, cb) {
      const userEmail = profile?._json?.email_verified && profile?._json?.email;

      const userGoogleId = profile?.id;

      if (!userEmail) {
        return cb(
          new AppError("User doesn't have an email or it is not verified", 403)
        );
      }

      if (!userGoogleId) {
        return cb(new AppError("User doesn't have a Google user ID", 403));
      }

      createOrGetUser({ email: userEmail, googleId: userGoogleId })
        .then((user) => {
          cb(null, user);
        })
        .catch((error) => cb(error));
    }
  );

export default googleStrategy;
