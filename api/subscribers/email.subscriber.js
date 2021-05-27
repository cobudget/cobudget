const EmailService = require("../services/EmailService/email.service");
//const orgHasDiscourse = (org) => org.discourse.url && org.discourse.apiKey;

module.exports = {
  initialize(eventHub, models, kcAdminClient) {
    eventHub.subscribe(
      "create-comment",
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
