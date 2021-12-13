import { sendEmail } from "server/send-email";
import prisma from "../../prisma";

export default class EmailService {
  static async sendCommentNotification({
    dream,
    event,
    currentOrg,
    currentCollMember,
    currentUser,
    comment,
  }) {
    const cocreators = await prisma.collectionMember.findMany({
      where: { buckets: { some: { id: dream.id } } },
      include: { user: true },
    });

    console.log({ inEmailNotification: currentCollMember });
    const emails = cocreators
      .filter(
        (collectionMember) => collectionMember.id !== currentCollMember.id
      )
      .map((collectionMember) => currentUser.email);

    const link = `https://${process.env.DEPLOY_URL}/${
      currentOrg?.slug ?? "c"
    }/${event.slug}/${dream.id}`;
    const subject = `${currentUser.username} commented on ${dream.title}`;
    const text = `"${comment.content}"\n\nGo here to reply: ${link}`;
    await sendEmail({ to: emails, subject, text });
  }

  // static async sendEmail(emails, subject, text) {
  //   if (process.env.NODE_ENV === "production" && emails.length) {
  //     const data = {
  //       from: `${process.env.EMAIL_SENDER}`,
  //       to: emails,
  //       subject,
  //       text,
  //     };
  //     return mailgun
  //       .messages()
  //       .send(data)
  //       .then(() => {
  //         console.log("Successfully sent emails");
  //         return true;
  //       })
  //       .catch((error) => {
  //         console.error({ error });
  //         throw new Error(error.message);
  //       });
  //   } else {
  //     console.log(`In development, not sending ${emails.length} emails`);
  //   }
  // }

  static async sendRequestToJoinNotifications(
    organization,
    user,
    event,
    emails
  ) {
    // if (process.env.NODE_ENV === "production") {
    //   const domain = createDomain(organization);

    //   var data = {
    //     from: `${process.env.EMAIL_SENDER}`,
    //     to: emails,
    //     subject: `Request to join ${event.title}`,
    //     text: `${user.name} (${user.email}) is requesting to join ${event.title}. Go here to approve: ${domain}/${event.slug}/members`,
    //   };
    //   return mailgun
    //     .messages()
    //     .send(data)
    //     .then(() => {
    //       console.log("Successfully sent request to join");
    //       return true;
    //     })
    //     .catch((error) => {
    //       console.error({ error });
    //       throw new Error(error.message);
    //     });
    // } else {
    console.log("in development, not sending request to join notifications");
    // }
  }
}
