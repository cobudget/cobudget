import { SendEmailInput, sendEmails } from "server/send-email";
import isURL from "validator/lib/isURL";
import escapeImport from "validator/lib/escape";
import { uniqBy } from "lodash";
import prisma from "../../prisma";
import { orgHasDiscourse } from "server/subscribers/discourse.subscriber";

/** path including leading slash */
function appLink(path: string): string {
  const protocol = process.env.NODE_ENV == "production" ? "https" : "http";
  const url = `${protocol}://${process.env.DEPLOY_URL}${path}`;
  if (!isURL(url, { host_whitelist: [process.env.DEPLOY_URL.split(":")[0]] }))
    throw new Error(`Invalid link in mail: ${url}`);
  return url;
}

function escape(input: string): string | undefined | null {
  // sometimes e.g. usernames are null atm
  if (input === null || typeof input === "undefined") return input;
  return escapeImport(input);
}

const footer = `<i>Cobudget helps groups collaboratively ideate, gather and distribute funds to projects that matter to them. <a href="https://guide.cobudget.co/">Discover how it works.</a></i>`;

export default {
  sendCommentNotification: async ({
    dream,
    event,
    currentOrg,
    currentCollMember,
    currentUser,
    comment,
  }) => {
    const cocreators = await prisma.collectionMember.findMany({
      where: { buckets: { some: { id: dream.id } } },
      include: { user: true },
    });

    const bucketLink = appLink(
      `/${currentOrg?.slug ?? "c"}/${event.slug}/${dream.id}`
    );

    const cocreatorEmails: SendEmailInput[] = cocreators
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
          ${footer}
          `,
        })
      );

    await sendEmails(cocreatorEmails);

    if (!orgHasDiscourse(currentOrg)) {
      const comments = await prisma.comment.findMany({
        where: { bucketId: dream.id },
        include: {
          collMember: {
            include: {
              user: true,
            },
          },
        },
      });
      const commenters = uniqBy(
        comments
          .map((comment) => comment.collMember.user)
          .filter((user) => currentUser.id !== user.id)
          // don't email the cocreators, we just emailed them above
          .filter(
            (user) =>
              !cocreators
                .map((cocreator) => cocreator.user.id)
                .includes(user.id)
          ),
        "id"
      );
      const commenterEmails = commenters.map((recipient) => ({
        to: recipient.email,
        subject: `New comment by ${currentUser.name} in bucket ${dream.title}`,
        html: `Hey ${escape(recipient.name)}!
          <br/><br/>
          People are talking about “${escape(
            dream.title
          )}” - <a href="${bucketLink}">have a look at the new comments</a>.
          <br/><br/>
          "${escape(comment.content)}"
          <br/><br/>
          ${footer}
        `,
      }));
      await sendEmails(commenterEmails);
    }
  },
};
