import auth from "lib/auth";
import getHostInfo from "utils/getHostInfo";

export default async function login(req, res) {
  const { host } = getHostInfo(req);

  const path = req.headers?.referer?.split(host)[1];

  try {
    await auth(req).handleLogin(req, res, {
      ...(path && { returnTo: path }),
    });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).end(error.message);
  }
}
