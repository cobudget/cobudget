import auth from "lib/auth";

export default async function profile(req, res) {
  try {
    await auth(req).handleProfile(req, res, {});
  } catch (error) {
    res.status(200).end();
    //res.status(error.status || 500).end(error.message);
  }
  res.end();
}
