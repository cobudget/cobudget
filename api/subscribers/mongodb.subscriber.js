const { orgHasDiscourse } = require("./discourse.subscriber");
const MIN_POST_LENGTH = 3;

module.exports = {
  initialize(eventHub, models, kcAdminClient) {
    eventHub.subscribe(
      "create-dream",
      "mongodb",
      async ({ currentOrg, currentOrgMember, event, dream, comment }) => {

      }
    );

    eventHub.subscribe(
      "publish-dream",
      "mongodb",
      async ({ dream, unpublish }) => {
        dream.published = !unpublish;
        return dream.save();
      }
    )

    eventHub.subscribe(
      "create-comment",
      "mongodb",
      async ({ currentOrg, currentOrgMember, event, dream, comment }) => {
        if (orgHasDiscourse(currentOrg)) { return; }

        if (comment.content.length < MIN_POST_LENGTH)
          throw new Error(
            `Your post needs to be at least ${MIN_POST_LENGTH} characters long!`
          );

        dream.comments.push(comment);
        dream.save();

        return dream.comments.reverse()[0];
      }
    );

    eventHub.subscribe(
      "edit-comment",
      "mongodb",
      async ({ currentOrg, currentOrgMember, event, eventMember, dream, comment }) => {
        if (orgHasDiscourse(currentOrg)) { return; }

        const existing = dream.comments.find(c => (
          c._id.toString() === comment.id && (
            c.authorId.toString() === currentOrgMember.id.toString() ||
            eventMember?.isAdmin
          )
        ));

        if (!existing)
          throw new Error(
            "Cant find that comment - Does this comment belongs to you?"
          );

        existing.content = comment.content;
        existing.updatedAt = new Date();
        dream.save();

        return existing;
      }
    );

    eventHub.subscribe(
      "delete-comment",
      "mongodb",
      async ({ currentOrg, currentOrgMember, event, dream, comment }) => {
        if (orgHasDiscourse(currentOrg)) { return; }

        dream.comments = dream.comments.filter(({ id }) => id.toString() !== comment.id.toString());
        dream.save();
      }
    );
  },
};
