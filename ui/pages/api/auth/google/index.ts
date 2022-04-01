import passport from "passport";
import handler from "../../../../server/api-handler";

export default handler().use(passport.authenticate("google"));
