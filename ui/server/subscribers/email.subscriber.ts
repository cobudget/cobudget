import emailService from "../services/EmailService/email.service";
export default {
  initialize(eventHub) {
    eventHub.subscribe(
      "create-comment",
      "email",
      async ({
        currentOrg,
        currentCollMember,
        currentUser,
        event,
        dream,
        comment,
      }) => {
        await emailService.sendCommentNotification({
          currentOrg,
          currentCollMember,
          currentUser,
          dream,
          event,
          comment,
        });
      }
    );
  },
};
