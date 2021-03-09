module.exports = {
  async up(db, client) {
    await db
      .collection("members")
      .rename("eventmembers", function (err, newColl) {
        if (err) console.error(err);
      });
  },

  async down(db, client) {
    await db
      .collection("eventmembers")
      .rename("members", function (err, newColl) {
        if (err) console.error(err);
      });
  },
};
