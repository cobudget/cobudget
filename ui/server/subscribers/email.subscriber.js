import EmailService from "../services/EmailService/email.service";
export default {
  initialize(eventHub) {
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
        });
      }
    );
  },
};
