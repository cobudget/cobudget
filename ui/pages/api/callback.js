import { parseCookies, destroyCookie } from "nookies";
import auth from "lib/auth";

export default async function callback(req, res) {
  const cookies = parseCookies({ req });
  const redirectTo = cookies.authRedir ?? "/";

  destroyCookie({ res }, "authRedir");

  try {
    await auth(req).handleCallback(req, res, {
      redirectTo,
    });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).end(error.message);
  }
}
