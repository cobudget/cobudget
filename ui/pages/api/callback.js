import auth from "lib/auth";

export default async function callback(req, res) {
  let redirectTo;

  const {
    query: { redirectPath },
  } = req;

  // build a path to redirect to from query parameter(s) `redirectPath`
  if (Array.isArray(redirectPath)) {
    redirectTo = redirectPath.reduce(
      (str, curr) => str + "/" + decodeURIComponent(curr),
      ""
    );

    // if it is not an array, it is a string (only one part)
  } else if (redirectPath) {
    redirectTo = `/${redirectPath}`;
  }

  try {
    await auth(req, redirectPath).handleCallback(req, res, {
      redirectTo: redirectTo ?? "/",
    });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).end(error.message);
  }
}
