// const mailgun = require("mailgun-js")({
//   apiKey: process.env.MAILGUN_API_KEY,
//   domain: process.env.MAILGUN_DOMAIN,
//   host: process.env.MAILGUN_HOST,
// });
import { sendEmail } from "server/send-email";
import prisma from "../../prisma";

export default class EmailService {
  static async sendCommentNotification({
    dream,
    event,
    currentOrg,
    currentOrgMember,
    comment,
  }) {
    const cocreators = await prisma.collectionMember.findMany({
      where: { buckets: { some: { id: dream.id } } },
      include: { orgMember: { include: { user: true } } },
    });

    // const cocreatorEventMemberIds = dream.cocreators;

    // const eventMembers = await EventMember.find({
    //   _id: { $in: cocreatorEventMemberIds },
    // });

    // const orgMemberIds = eventMembers.map((member) => member.orgMemberId);
    // const orgMembers = await OrgMember.find({ _id: { $in: orgMemberIds } });

    const emails = cocreators
      .filter(
        (collectionMember) =>
          collectionMember.orgMemberId !== currentOrgMember.id
      )
      .map((collectionMember) => collectionMember.orgMember.user.email);
    // orgMembers.forEach(async (orgMember) => {
    //   const { email } = await kcAdminClient.users.findOne({
    //     id: orgMember.userId,
    //   });
    //   if (orgMember.id !== currentOrgMember.id) emails.push(email);
    // });

    // const { username } = await kcAdminClient.users.findOne({
    //   id: currentOrgMember.userId,
    // });

    const link = `https://${process.env.DEPLOY_URL}/${currentOrg.slug}/${event.slug}/${dream.id}`;
    const subject = `${currentOrgMember.user.username} commented on ${dream.title}`;
    const text = `"${comment.content}"\n\nGo here to reply: ${link}`;
    await sendEmail({ to: emails, subject, text });
    //await this.sendEmail(emails, subject, text);
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
