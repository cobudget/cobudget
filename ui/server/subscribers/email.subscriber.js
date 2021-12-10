import EmailService from "../services/EmailService/email.service";
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
        await EmailService.sendCommentNotification({
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
