import auth from "lib/auth";

export default async function getToken(req, res) {
  try {
    const tokenCache = auth(req).tokenCache(req, res);
    const { accessToken } = await tokenCache.getAccessToken();
    if (accessToken) res.send(accessToken);
    res.status(204).end();
  } catch (error) {
    //console.error(error);
    res.status(error.status || 500).end(error.message);
  }
}
