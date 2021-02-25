import auth from "lib/auth";
import getHostInfo from "utils/getHostInfo";

export default async function login(req, res) {
  const { host } = getHostInfo(req);
  let redirectPath;
  if (req?.headers?.referer) {
    // pick out path and remove first slash
    const path = req.headers.referer.split(host)[1].substr(1);

    if (path.length > 0) {
      // create redirectPath array if path exists (is not the root)
      redirectPath = path.split("/").map((str) => encodeURIComponent(str));
    }
  }
  try {
    await auth(req, redirectPath).handleLogin(req, res);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).end(error.message);
  }
}
