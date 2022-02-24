import handler from "../../../server/api-handler";

export default handler().get((req, res) => {
  req.logout();
  req.session = null;
  res.redirect("/");
  //res.send("logged out", 401);
});
