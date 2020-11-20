import auth from "lib/auth";

export default async function getToken(req, res) {
  try {
    const session = await auth(req).getSession(req);

    if (session?.accessToken) res.send(session.accessToken);
    res.status(204).end();
  } catch (error) {
    //console.error(error);
    res.status(error.status || 500).end(error.message);
  }
}
