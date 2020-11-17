import auth from "lib/auth";

export default async function logout(req, res) {
  try {
    await auth.handleLogout(req, res);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).end(error.message);
  }
}
