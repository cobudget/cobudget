const EmailService = require("../services/EmailService/email.service");

module.exports = {
  initialize(eventHub, models, kcAdminClient) {
    eventHub.subscribe(
      "create-comment",
      "email",
      async ({ currentOrg, currentOrgMember, event, dream, comment }) => {
        await EmailService.sendCommentNotification({
          currentOrg,
          currentOrgMember,
          dream,
          event,
          comment,
          models,
          kcAdminClient,
        });
      }
    );
  },
};
