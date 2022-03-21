import FacebookStrategy from "passport-facebook";
import { appLink } from "utils/internalLinks";

const facebookStrategy =
  process.env.FACEBOOK_APP_ID &&
  process.env.FACEBOOK_APP_SECRET &&
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: appLink("/api/auth/facebook/callback"),
      // TODO: request email
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log({ accessToken, refreshToken, profile, cb });
      cb("totally an error");
      //User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      //  return cb(err, user);
      //});
    }
  );

export default facebookStrategy;
