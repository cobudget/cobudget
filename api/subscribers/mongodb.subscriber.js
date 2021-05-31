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

        return comment;
      }
    );

    eventHub.subscribe(
      "edit-comment",
      "mongodb",
      async ({ currentOrg, currentOrgMember, event, eventMember, dream, comment }) => {
        if (orgHasDiscourse(currentOrg)) { return; }

        const existing = dream.comments.find(
          (comment) =>
            comment._id.toString() === commentId &&
            (comment.authorId.toString() === currentOrgMember.id.toString() ||
              eventMember?.isAdmin)
        );

        if (!existing)
          throw new Error(
            "Cant find that comment - Does this comment belongs to you?"
          );

        existing.content = content;
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

        dream.comments = dream.comments.filter(({ id }) => id.toString() !== commentId);
        dream.save();
      }
    );
  },
};
