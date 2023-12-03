import passport from "passport";
import handler from "../../../../server/api-handler";
import jwt from "jsonwebtoken";

export default handler()
  .use((req, res, next) => {
    const { token } = req.query;
    const payload = jwt.verify(token, process.env.MAGIC_LINK_SECRET);
    console.log(payload);
    next();
  })
  .use(passport.authenticate("magiclogin"))
  .use((req, res) => {
    res.redirect(req.user?.redirect || "/");
  });
