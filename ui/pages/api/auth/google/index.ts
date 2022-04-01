import passport from "passport";
import handler from "../../../../server/api-handler";

export default handler()
  //.use(function (req, res, next) {
  //  if (req.query?.fb_no_email_scope) {
  //    // the user didn't permit us to get their email so we need to explicitly re-request it from fb
  //    passport.authenticate("facebook", {
  //      authType: "rerequest",
  //      scope: ["email"],
  //    } as any)(req, res, next);
  //  } else {
  //    passport.authenticate("facebook", { scope: ["email"] })(req, res, next);
  //  }
  //});
  .use(passport.authenticate("google"));
