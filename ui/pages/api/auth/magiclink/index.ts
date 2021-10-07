import handler from "../../../../server/api-handler";
import magicLink from "../../../../server/passport/magicLink";

export default handler().post(magicLink.send);
