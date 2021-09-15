module.exports = {
  // eslint-disable-next-line no-unused-vars
  async up(db, client) {
    await db
      .collection("eventmembers")
      .updateMany({}, { $rename: { userId: "orgMemberId" } });
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  },

  // eslint-disable-next-line no-unused-vars
  async down(db, client) {
    await db
      .collection("eventmembers")
      .updateMany({}, { $rename: { orgMemberId: "userId" } });
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
