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

      // req actually contains a session here
      // TODO: do we need this?
      //(req as any).session.accessToken = accessToken;

      createOrGetUser({ email: userEmail, googleId: userGoogleId })
        .then((user) => {
          cb(null, user);
        })
        .catch((error) => cb(error));
    }
  );

export default googleStrategy;
