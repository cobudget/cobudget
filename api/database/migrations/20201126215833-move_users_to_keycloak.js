module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    // rename Member collection to EventMember
    // rename userId to orgMemberId
    // rename User collection to OrgMember
    // add userId (which is the keycloak Id)
    // how to get this? without doing it manually...
    // create users in keycloak here?
    // remove email/orgId index
    // rename dream.comments.authorId to orgMemberId?
    // rneame dream.flags.userId to orgMemberId?
    // rename logs.userId to orgMemberId?
    // rename grants.memberId to eventMemberId?
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
