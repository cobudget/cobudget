import passport from "passport";
import handler from "../../../../server/api-handler";

export default handler()
  .use(
    passport.authenticate("google", {
      failureRedirect: "/login",
      failureMessage: true, // errors get added to req.session.messages
    })
  )
  .use((req, res) => {
    res.redirect(req.user?.redirect || "/");
  });
