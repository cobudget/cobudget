import { SendEmailInput, sendEmails } from "server/send-email";
import isURL from "validator/lib/isURL";
import escape from "validator/lib/escape";
import prisma from "../../prisma";

/** path including leading slash */
function appLink(path: string): string {
  const protocol = process.env.NODE_ENV == "production" ? "https" : "http";
  const url = `${protocol}://${process.env.DEPLOY_URL}${path}`;
  if (!isURL(url)) throw new Error(`Invalid link in mail: ${url}`);
  return url;
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

    const bucketLink = appLink(
      `/${currentOrg?.slug ?? "c"}/${event.slug}/${dream.id}`
    );

    const emails: SendEmailInput[] = cocreators
      .filter(
        (collectionMember) => collectionMember.id !== currentCollMember.id
      )
      .map(
        (collectionMember): SendEmailInput => ({
          to: collectionMember.user.email,
          subject: `New comment by ${currentUser.name} in your bucket ${dream.title}`,
          html: `Hey ${escape(collectionMember.user.name)}!
          <br/><br/>
          Your bucket “${escape(
            dream.title
          )}” received a new comment. This could be a question or feedback regarding your idea.
          <br/><br/>
          "${escape(comment.content)}"
          <br/><br/>
          <a href="${bucketLink}">Have a look</a>
          <br/><br/>
          <i>Cobudget helps groups collaboratively ideate, gather and distribute funds to projects that matter to them. <a href="https://guide.cobudget.co/">Discover how it works.</a></i>
          `,
        })
      );

    await sendEmails(emails);
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
