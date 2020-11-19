import auth from "lib/auth";

export default async function session(req, res) {
  try {
    const { accessToken } = await auth(req).getSession(req);

    if (accessToken) res.send(accessToken);
    res.status(500).end(accessToken);
  } catch (error) {
    // console.error(error);
    res.status(error.status || 500).end(error.message);
  }
}
