const EmailService = require("../services/EmailService/email.service");
const initKcAdminClient = require("../utils/initKcAdminClient");
//const orgHasDiscourse = (org) => org.discourse.url && org.discourse.apiKey;

module.exports = {
  initialize(eventHub, models) {
    eventHub.subscribe(
      "create-comment",
      async ({ currentOrg, currentOrgMember, event, dream, comment }) => {
        const kcAdminClient = await initKcAdminClient();

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
