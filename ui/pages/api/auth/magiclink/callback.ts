import passport from "passport";
import handler from "../../../../server/api-handler";

export default handler()
  .use(passport.authenticate("magiclogin"))
  .use((req, res) => {
    res.redirect(req.user?.redirect || "/");
  });
