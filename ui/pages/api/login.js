import auth from "../../lib/auth";

export default async function login(req, res) {
  try {
    await auth.handleLogin(req, res);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).end(error.message);
  }
}
