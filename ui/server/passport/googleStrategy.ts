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
      //profileFields: ["id", "email"],
      scope: ["email"],
      passReqToCallback: true,
    },
    function (req, accessToken, refreshToken, profile, cb) {
      console.log("google strat", { accessToken, refreshToken, profile });
      return cb("errooour");

      //profile: {
      //  id: '123',
      //  displayName: undefined,
      //  emails: [ [Object] ],
      //  photos: [ [Object] ],
      //  provider: 'google',
      //  _raw: '{\n' +
      //    '  "sub": "123",\n' +
      //    '  "picture": "https://example.com/a.jpg",\n' +
      //    '  "email": "my@email.com",\n' +
      //    '  "email_verified": true\n' +
      //    '}',
      //  _json: {
      //    sub: '123',
      //    picture: 'https://example.com/a.jpg',
      //    email: 'my@email.com',
      //    email_verified: true
      //  }
      //}

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

      // req actually contains a session here
      (req as any).session.accessToken = accessToken;

      createOrGetUser({ email: userEmail, facebookId: userFbId })
        .then((user) => {
          cb(null, user);
        })
        .catch((error) => cb(error));
    }
  );

export default googleStrategy;
