import { Strategy } from "passport-facebook";
import { appLink } from "utils/internalLinks";
import AppError from "server/utils/AppError";
import { createOrGetUser } from "./helpers";

const facebookStrategy =
  process.env.FACEBOOK_APP_ID &&
  process.env.FACEBOOK_APP_SECRET &&
  new Strategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: appLink("/api/auth/facebook/callback"),
      profileFields: ["id", "email"],
    },
    function (accessToken, refreshToken, profile, cb) {
      if (!profile?.emails) {
        return cb(
          // Exact string important, matched against in api-handler
          new AppError("Email scope not provided on Facebook login", 403)
        );
      }

      const userEmail =
        profile.emails.length > 0 ? profile.emails[0].value : null;

      const userFbId = profile?.id;

      if (!userEmail) {
        return cb(new AppError("User doesn't have an email", 403));
      }

      if (!userFbId) {
        return cb(new AppError("User doesn't have a Facebook user ID", 403));
      }

      console.log("user fb id:", userFbId, "user email:", userEmail);

      // TODO: save userFbId in user object or something, alt. find the existing user
      createOrGetUser({ email: userEmail, facebookId: userFbId })
        .then((user) => {
          cb(null, user);
        })
        .catch((error) => cb(error));
    }
  );

export default facebookStrategy;
