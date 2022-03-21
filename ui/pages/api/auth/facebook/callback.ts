import passport from "passport";
import handler from "../../../../server/api-handler";

export default handler()
  .use(
    passport.authenticate("facebook", {
      failureRedirect: "/login",
      failureMessage: true, // errors get added to req.session.messages
    })
  )
  .use((req, res) => {
    console.log("fb cb req:", req, "res:", res);
    res.redirect(req.user?.redirect || "/");
  });
