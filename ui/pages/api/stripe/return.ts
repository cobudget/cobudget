import handler from "server/api-handler";

export default handler().use((req, res) => {
  const sesh = req.session?.redirect;
  if (sesh) {
    req.session.redirect = undefined;
  }
  res.redirect(sesh ?? "/");
});
