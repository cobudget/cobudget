import { sendEmail } from "server/send-email";
import prisma from "../../prisma";

/** path including leading slash */
function appLink(path: string): string {
  const protocol = process.env.NODE_ENV == "production" ? "https" : "http";
  return `${protocol}://${process.env.DEPLOY_URL}${path}`;
}

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

    const emails = cocreators
      .filter(
        (collectionMember) => collectionMember.id !== currentCollMember.id
      )
      .map((collectionMember) => collectionMember.user.email);

    const link = appLink(
      `/${currentOrg?.slug ?? "c"}/${event.slug}/${dream.id}`
    );
    const subject = `${currentUser.username} commented on ${dream.title}`;
    const text = `"${comment.content}"\n\nGo here to reply: ${link}`;
    await sendEmail({ to: emails, subject, text });
  }

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
