import handler from "../../../server/api-handler";

export default handler().get((req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send("Logout failed");
    }
    req.session = null;
    res.redirect("/");
  });
});
