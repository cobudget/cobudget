import auth from "lib/auth";
import getHostInfo from "utils/getHostInfo";

export default async function callback(req, res) {
  const hostInfo = getHostInfo(req);

  try {
    await auth(hostInfo).handleCallback(req, res, { redirectTo: "/" });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).end(error.message);
  }
}
