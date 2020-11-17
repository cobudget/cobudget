import auth from "lib/auth";

export default async function callback(req, res) {
  try {
    await auth.handleCallback(req, res, {});
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).end(error.message);
  }
}
