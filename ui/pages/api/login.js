import { setCookie } from "nookies";
import auth from "lib/auth";
import getHostInfo from "utils/getHostInfo";

export default async function login(req, res) {
  const { host } = getHostInfo(req);
  if (req?.headers?.referer) {
    const path = req.headers.referer.split(host)[1];

    setCookie({ res }, "authRedir", path, {
      maxAge: 60 * 60, // one hour
    });
  }
  try {
    await auth(req).handleLogin(req, res);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).end(error.message);
  }
}
