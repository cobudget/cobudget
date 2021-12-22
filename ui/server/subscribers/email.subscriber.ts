import emailService from "../services/EmailService/email.service";
export default {
  initialize(eventHub) {
    eventHub.subscribe("create-comment", "email", async (args) => {
      await emailService.sendCommentNotification(args);
    });
    eventHub.subscribe("allocate-to-member", "email", async (args) => {
      await emailService.allocateToMemberNotification(args);
    });
    eventHub.subscribe("cancel-funding", "email", async (args) => {
      await emailService.cancelFundingNotification(args);
    });
  },
};
