import passport from "passport";
import handler from "../../../../server/api-handler";
import jwt from "jsonwebtoken";
import prisma from "server/prisma";

export default handler()
  .use(async (req, res, next) => {
    const { token } = req.query;
    const payload = jwt.verify(token, process.env.MAGIC_LINK_SECRET);

    const user = await prisma.user.findUnique({
      where: { email: payload.destination },
    });
    if (
      process.env.ALLOW_REUSE_LOGIN_LINK !== "1" &&
      user &&
      user?.magiclinkCode !== payload.code
    ) {
      return res.redirect("/login?error=invalid-token");
    }
    next();
  })
  .use(passport.authenticate("magiclogin"))
  .use(async (req, res) => {
    await prisma.user.update({
      where: { email: req.user?.email },
      data: { magiclinkCode: "" },
    });
    res.redirect("/");
  });
