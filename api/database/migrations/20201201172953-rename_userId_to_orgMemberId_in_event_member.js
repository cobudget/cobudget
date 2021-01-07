module.exports = {
  async up(db, client) {
    await db
      .collection('eventmembers')
      .update(
        {},
        { $rename: { userId: 'orgMemberId' } },
        { multi: true },
        function (err, blocks) {
          if (err) {
            throw err;
          }
        }
      );
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  },

  async down(db, client) {
    await db
      .collection('eventmembers')
      .update(
        {},
        { $rename: { orgMemberId: 'userId' } },
        { multi: true },
        function (err, blocks) {
          if (err) {
            throw err;
          }
        }
      );
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
