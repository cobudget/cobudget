import { SendEmailInput, sendEmail, sendEmails } from "server/send-email";
import isURL from "validator/lib/isURL";
import escapeImport from "validator/lib/escape";
import { uniqBy } from "lodash";
import { Prisma } from "@prisma/client";
import prisma from "../../prisma";
import { getRequestOrigin } from "../../get-request-origin";
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
  inviteMember: async ({
    email,
    currentUser,
    collection,
    currentOrg,
  }: {
    email: string;
    currentUser: { name: string };
    collection?: {
      title: string;
      slug: string;
      organization: { slug: string };
    };
    currentOrg?: { slug: string; name: string };
  }) => {
    await sendEmail({
      to: email,
      subject: `${currentUser.name} invited you to "${
        currentOrg?.name ?? collection.title
      }" on Cobudget`,
      text: `View and login here: ${appLink(
        `/${currentOrg?.slug ?? collection.organization.slug}/${
          collection.slug
        }`
      )}`,
    });
  },
  loginMagicLink: async ({ destination, href, code, req }) => {
    const link = `${getRequestOrigin(req)}${href}`;

    const hasAccountAlready = await prisma.user.findUnique({
      where: { email: destination },
    });

    if (hasAccountAlready) {
      await sendEmail({
        to: destination,
        subject: `Your Cobudget login link`,
        html: `<a href="${link}">Click here to login</a>
        <br/><br/>
        Verification code: ${code}
        <br/><br/>
        ${footer}
        `,
      });
    } else {
      await sendEmail({
        to: destination,
        subject: `Welcome to Cobudget - confirm your account and get started!`,
        html: `Welcome!
        <br/><br/>
        Your Cobudget account has been created! We're excited to welcome you to the community.
        <br/><br/>
        Please confirm your account by <a href="${link}">Clicking here</a>! Verification code: ${code}.
        <br/><br/>
        ${footer}
      `,
      });
    }
  },
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
  allocateToMemberNotification: async ({
    collectionMemberId,
    collectionId,
    oldAmount,
    newAmount,
  }) => {
    if (newAmount <= oldAmount) return;

    const { user } = await prisma.collectionMember.findUnique({
      where: { id: collectionMemberId },
      include: { user: true },
    });
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: { organization: true },
    });
    const org = collection.organization;

    await sendEmail({
      to: user.email,
      subject: `${user.name}, you’ve received funds to spend in the ${collection.title} Cobudget!`,
      html: `You have received ${(newAmount - oldAmount) / 100} ${
        collection.currency
      } in the ${escape(collection.title)} Cobudget.
      <br/><br/>
      Decide now which buckets to allocate your funds to by checking out the current proposals in <a href="${appLink(
        `/${org?.slug ?? "c"}/${collection.slug}`
      )}">${escape(collection.title)}</a>.
      <br/><br/>
      ${footer}
      `,
    });
  },
  cancelFundingNotification: async ({
    bucket,
  }: {
    bucket: Prisma.BucketCreateInput & {
      collection: Prisma.CollectionCreateInput & {
        organization: Prisma.OrganizationCreateInput;
      };
      Contributions: Array<
        Prisma.ContributionCreateInput & {
          collectionMember: Prisma.CollectionMemberCreateInput & {
            user: Prisma.UserCreateInput;
          };
        }
      >;
    };
  }) => {
    const refundedCollMembers = uniqBy(
      bucket.Contributions.map((contribution) => contribution.collectionMember),
      "id"
    );
    const emails: SendEmailInput[] = refundedCollMembers.map((collMember) => {
      const amount = bucket.Contributions.filter(
        (contrib) => contrib.collectionMember.id === collMember.id
      )
        .map((contrib) => contrib.amount)
        .reduce((a, b) => a + b, 0);

      return {
        to: collMember.user.email,
        subject: `${bucket.title} was cancelled`,
        html: `The bucket “${escape(
          bucket.title
        )}” you have contributed to was cancelled in ${escape(
          bucket.collection.title
        )}. You've been refunded ${amount / 100} ${bucket.collection.currency}.
        <br/><br/>
        Explore other buckets you can fund in <a href="${appLink(
          `/${bucket.collection.organization.slug}/${bucket.collection.slug}`
        )}">${escape(bucket.collection.title)}</a>.
        <br/><br/>
        ${footer}
        `,
      };
    });
    await sendEmails(emails);
  },
};
