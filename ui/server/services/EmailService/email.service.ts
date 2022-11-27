import { SendEmailInput, sendEmail, sendEmails } from "server/send-email";
import escapeImport from "validator/lib/escape";
import { appLink } from "utils/internalLinks";
import { uniqBy } from "lodash";
import { unified } from "unified";
import type { Plugin as UnifiedPlugin } from "unified";
import { visit } from "unist-util-visit";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

import { Prisma } from "@prisma/client";
import prisma from "../../prisma";
import { getRequestOrigin } from "../../get-request-origin";
import subscibers from "server/subscribers/discourse.subscriber";
import {
  bucketIncome,
  bucketTotalContributions,
  bucketMinGoal,
} from "server/graphql/resolvers/helpers";
import { tailwindHsl } from "utils/colors";

const { groupHasDiscourse } = subscibers;

function escape(input: string): string | undefined | null {
  // sometimes e.g. usernames are null atm
  if (input === null || typeof input === "undefined") return input;
  return escapeImport(input);
}

const mdToHtmlConverter = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize) // sanitization done here
  .use(rehypeStringify);

async function mdToHtml(md: string) {
  return String(await mdToHtmlConverter.process(md));
}

function quotedSection(html: string) {
  return `<div style="background-color: ${tailwindHsl.anthracit[200]}; padding: 1px 15px;">${html}</div>`;
}

const footer = `<div><i>Cobudget helps groups collaboratively ideate, gather and distribute funds to projects that matter to them. <a href="https://cobudget.helpscoutdocs.com/">Discover how it works.</a></i></div>
<br/>
<div><a href="${appLink(
  "/settings"
)}">Go here</a> to change what kinds of email notifications you receive</div>`;

export default {
  roundJoinRequest: async ({ round, roundMember }) => {
    const admins = await prisma.roundMember.findMany({
      where: { roundId: round.id, isAdmin: true },
      include: { user: { include: { emailSettings: true } } },
    });

    const user = await prisma.user.findUnique({
      where: { id: roundMember.userId },
    });

    const group = await prisma.group.findFirst({
      where: { rounds: { some: { id: round.id } } },
    });

    const roundLink = appLink(`/${group.slug}/${round.slug}`);

    const adminEmails: SendEmailInput[] = admins
      .filter((admin) => admin.user?.emailSettings?.roundJoinRequest ?? true)
      .map((admin) => ({
        to: admin.user.email,
        subject: `Someone wants to join ${round.title}`,
        html: `${escape(
          user.name
        )} has requested to join <a href="${roundLink}">${escape(
          round.title
        )}</a>:
        <br/>
        <a href="${roundLink}/participants">Click here</a> to review this request
        <br/><br/>
        ${footer}
        `,
      }));

    await sendEmails(adminEmails);
  },
  inviteMember: async ({
    email,
    currentUser,
    round,
    currentGroup,
  }: {
    email: string;
    currentUser: { name: string };
    round?: {
      title: string;
      slug: string;
      info?: string;
      group: { slug: string };
    };
    currentGroup?: { slug: string; name: string; info?: string };
  }) => {
    const invitedUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    const inviteLink = appLink(
      `/${currentGroup?.slug ?? round.group.slug}/${round?.slug ?? ""}`
    );

    const groupCollName = currentGroup?.name ?? round.title;

    const mdPurpose = currentGroup?.info ?? round?.info ?? "";

    const htmlPurpose = await mdToHtml(mdPurpose);

    await sendEmail(
      {
        to: email,
        subject: `${currentUser.name} invited you to join "${groupCollName}" on ${process.env.PLATFORM_NAME}!`,
        html: `Hi${invitedUser.name ? ` ${escape(invitedUser.name)}` : ""}!
      <br/><br/>
      You have been invited by ${escape(currentUser.name)} to ${escape(
          groupCollName
        )} on ${process.env.PLATFORM_NAME}.
      Accept your invitation by <a href="${inviteLink}">Clicking here</a>.
      ${
        htmlPurpose
          ? `<br/><br/>
            ${quotedSection(htmlPurpose)}`
          : ""
      }
      <br/><br/>
      ${footer}
      `,
      },
      false
    );
  },
  loginMagicLink: async ({ destination, href, code, req }) => {
    const link = `${getRequestOrigin(req)}${href}`;

    const hasAccountAlready = await prisma.user.findUnique({
      where: { email: destination },
    });

    if (hasAccountAlready) {
      await sendEmail(
        {
          to: destination,
          subject: `Your ${process.env.PLATFORM_NAME} login link`,
          html: `<a href="${link}">Click here to login</a>
        <br/><br/>
        Verification code: ${code}
        <br/><br/>
        ${footer}
        `,
        },
        false
      );
    } else {
      await sendEmail(
        {
          to: destination,
          subject: `Welcome to ${process.env.PLATFORM_NAME} - confirm your account and get started!`,
          html: `Welcome!
        <br/><br/>
        Your ${process.env.PLATFORM_NAME} account has been created! We're excited to welcome you to the community.
        <br/><br/>
        Please confirm your account by <a href="${link}">Clicking here</a>! Verification code: ${code}.
        <br/><br/>
        ${footer}
      `,
        },
        false
      );
    }
  },
  welcomeEmail: async ({ newUser }: { newUser: { email: string } }) => {
    const { collMemberships } = await prisma.user.findUnique({
      where: { email: newUser.email },
      include: {
        collMemberships: {
          include: { round: { include: { group: true } } },
        },
      },
    });

    const createYourFirst =
      collMemberships.length > 0
        ? `Jump right in and <a href="${appLink(
            `/${collMemberships[0].round.group.slug}/${collMemberships[0].round.slug}`
          )}">create your first Bucket</a>!`
        : `Jump right in and <a href="${appLink(
            "/new-round"
          )}">create your first Round</a>!`;

    await sendEmail({
      to: newUser.email,
      subject: `Welcome to ${process.env.PLATFORM_NAME}!`,
      html: `You’ve just taken your first step towards co-creating and funding projects that matter to you and your crew.
      <br/><br/>
      Since 2014 we’ve been on a path to change the ways groups and communities make decisions about how to spend their money, making this process more participatory, collaborative and transparent. Cobudget is a tool that encourages participation at every stage; people propose ideas, co-create and refine them with others, and finally distribute funds to the projects they most want to see.
      <br/><br/>
      We are thrilled to have you with us!
      <br/><br/>
      <b>How to get started?</b>
      <ul>
      <li>Check out the <a href="https://guide.cobudget.com/">Cobudget docs</a> for some simple how-to’s</li>
      <li>${createYourFirst}</li>
      </ul>
      <br/>
      <b>Want to learn more?</b>
      <ul>
      <li>Dig into our <a href="https://guide.cobudget.com/article/12-case-studies">case studies</a> to see how others are using the tool</li>
      <li>Learn more about <a href="https://www.greaterthan.works/resources/sharing-power-by-sharing-money">Cobudget’s history</a>.</li>
      </ul>
      <br/>
      Ready to invite others to co-create and fund projects with you? <a href="${appLink(
        "/new-round"
      )}">Create a Round</a>!
      `,
    });
  },
  sendCommentNotification: async ({
    bucket,
    round,
    currentGroup,
    currentCollMember,
    currentUser,
    comment,
  }) => {
    const linkNodes = [];

    const gatherLinks: UnifiedPlugin = () => {
      return (tree) => {
        visit(tree, (node) => {
          if (node.type === "link") {
            linkNodes.push(node);
          }
        });
      };
    };

    const parser = unified().use(remarkParse).use(remarkGfm).use(gatherLinks);

    await parser.run(parser.parse(comment.content));

    const userLinkStart = appLink(`/user/`);

    const mentionedUserIds = linkNodes
      .map((link): string => link.url)
      .filter(Boolean)
      .filter((url) => url.startsWith(userLinkStart))
      .map((link) => link.split(userLinkStart)[1]);

    const mentionedUsersToEmail = uniqBy(
      await prisma.user.findMany({
        where: {
          id: { in: mentionedUserIds },
        },
        include: {
          emailSettings: true,
        },
      }),
      "id"
    )
      .filter((mentionedUser) => mentionedUser.id !== currentUser.id)
      .filter(
        (mentionedUser) => mentionedUser.emailSettings?.commentMentions ?? true
      );

    const bucketLink = appLink(
      `/${currentGroup.slug}/${round.slug}/${bucket.id}`
    );

    const commentAsHtml = quotedSection(await mdToHtml(comment.content));

    const mentionEmails: SendEmailInput[] = mentionedUsersToEmail.map(
      (mentionedUser) => ({
        to: mentionedUser.email,
        subject: `You were mentioned in a comment in the bucket ${bucket.title}`,
        html: `${escape(
          currentUser.name
        )} has just mentioned you in a comment in the bucket <a href="${bucketLink}">${escape(
          bucket.title
        )}</a>:
        <br/><br/>
        ${commentAsHtml}
        <br/><br/>
        ${footer}
        `,
      })
    );

    await sendEmails(mentionEmails);

    const cocreatorsToEmail = (
      await prisma.roundMember.findMany({
        where: { buckets: { some: { id: bucket.id } } },
        include: { user: { include: { emailSettings: true } } },
      })
    )
      .filter((roundMember) => roundMember.id !== currentCollMember.id)
      .filter(
        (roundMember) =>
          roundMember.user.emailSettings?.commentBecauseCocreator ?? true
      );

    const cocreatorEmails: SendEmailInput[] = cocreatorsToEmail
      // don't mail people here who were just mailed about being mentioned
      .filter(
        (cocreatorCollMember) =>
          !mentionedUsersToEmail
            .map((mentionedUser) => mentionedUser.id)
            .includes(cocreatorCollMember.user.id)
      )
      .map(
        (roundMember): SendEmailInput => ({
          to: roundMember.user.email,
          subject: `New comment by ${currentUser.name} in your bucket ${bucket.title}`,
          html: `Hey ${escape(roundMember.user.name)}!
          <br/><br/>
          Your bucket “${escape(bucket.title)}” received a new comment.
          <br/><br/>
          ${commentAsHtml}
          <br/><br/>
          <a href="${bucketLink}">Have a look</a>
          <br/><br/>
          ${footer}
          `,
        })
      );

    await sendEmails(cocreatorEmails);

    if (!groupHasDiscourse(currentGroup)) {
      const comments = await prisma.comment.findMany({
        where: { bucketId: bucket.id },
        include: {
          collMember: {
            include: {
              user: {
                include: {
                  emailSettings: true,
                },
              },
            },
          },
        },
      });

      const commentersToEmail = uniqBy(
        comments
          .map((comment) => comment.collMember.user)
          .filter((user) => currentUser.id !== user.id)
          .filter((user) => user.emailSettings?.commentBecauseCommented ?? true)
          // don't email the mentions nor cocreators, we just emailed them above
          .filter(
            (user) =>
              !cocreatorsToEmail
                .map((cocreator) => cocreator.user.id)
                .includes(user.id)
          )
          .filter(
            (user) =>
              !mentionedUsersToEmail
                .map((mentionedUser) => mentionedUser.id)
                .includes(user.id)
          ),
        "id"
      );

      const commenterEmails = commentersToEmail.map((recipient) => ({
        to: recipient.email,
        subject: `New comment by ${currentUser.name} in bucket ${bucket.title}`,
        html: `Hey ${escape(recipient.name)}!
          <br/><br/>
          People are talking about “${escape(
            bucket.title
          )}” - <a href="${bucketLink}">have a look at the new comments</a>.
          <br/><br/>
          ${commentAsHtml}
          <br/><br/>
          ${footer}
        `,
      }));
      await sendEmails(commenterEmails);
    }
  },
  allocateToMemberNotification: async ({
    roundMemberId,
    roundId,
    oldAmount,
    newAmount,
  }) => {
    if (newAmount <= oldAmount) return;

    const { user } = await prisma.roundMember.findUnique({
      where: { id: roundMemberId },
      include: { user: { include: { emailSettings: true } } },
    });
    const round = await prisma.round.findUnique({
      where: { id: roundId },
      include: { group: true },
    });
    const group = round.group;

    if (!(user.emailSettings?.allocatedToYou ?? true)) return null;

    await sendEmail({
      to: user.email,
      subject: `${user.name}, you’ve received funds to spend in ${round.title}!`,
      html: `You have received ${(newAmount - oldAmount) / 100} ${
        round.currency
      } in ${escape(
        round.title
      )}. <br/><br/>Decide now which buckets to allocate your funds to by checking out the current proposals in <a href="${appLink(
        `/${group.slug}/${round.slug}`
      )}">${escape(round.title)}</a>. <br/><br/>${footer}`,
    });
  },
  bulkAllocateNotification: async ({ roundId, membersData }) => {
    const round = await prisma.round.findUnique({
      where: { id: roundId },
      include: { group: true },
    });
    const emails = membersData
      .filter((member) => member.emailSettings?.allocatedToYou ?? true)
      .filter((member) => member.adjustedAmount > 0)
      .map((member) => {
        return {
          to: member.user.email,
          subject: `${member.user.name}, you’ve received funds to spend in ${round.title}!`,
          html: `You have received ${member.adjustedAmount / 100} ${
            round.currency
          } in ${escape(
            round.title
          )}. <br/><br/>Decide now which buckets to allocate your funds to by checking out the current proposals in <a href="${appLink(
            `/${round.group.slug}/${round.slug}`
          )}">${escape(round.title)}</a>.<br/><br/> ${footer}`,
        };
      });
    await sendEmails(emails);
  },
  cancelFundingNotification: async ({
    bucket,
  }: {
    bucket: Prisma.BucketCreateInput & {
      round: Prisma.RoundCreateInput & {
        group: Prisma.GroupCreateInput;
      };
      Contributions: Array<
        Prisma.ContributionCreateInput & {
          roundMember: Prisma.RoundMemberCreateInput & {
            user: Prisma.UserCreateInput & {
              emailSettings: Prisma.EmailSettingsCreateInput;
            };
          };
        }
      >;
    };
  }) => {
    const refundedCollMembersToEmail = uniqBy(
      bucket.Contributions.map(
        (contribution) => contribution.roundMember
      ).filter(
        (roundMember) =>
          roundMember.user.emailSettings?.refundedBecauseBucketCancelled ?? true
      ),
      "id"
    );
    const emails: SendEmailInput[] = refundedCollMembersToEmail.map(
      (collMember) => {
        const amount = bucket.Contributions.filter(
          (contrib) => contrib.roundMember.id === collMember.id
        )
          .map((contrib) => contrib.amount)
          .reduce((a, b) => a + b, 0);

        return {
          to: collMember.user.email,
          subject: `${bucket.title} was cancelled`,
          html: `The bucket “${escape(
            bucket.title
          )}” you have contributed to was cancelled in ${escape(
            bucket.round.title
          )}. You've been refunded ${amount / 100} ${bucket.round.currency}.
        <br/><br/>
        Explore other buckets you can fund in <a href="${appLink(
          `/${bucket.round.group.slug}/${bucket.round.slug}`
        )}">${escape(bucket.round.title)}</a>.
        <br/><br/>
        ${footer}
        `,
        };
      }
    );
    await sendEmails(emails);
  },
  bucketPublishedNotification: async ({
    currentGroup,
    currentGroupMember,
    round,
    bucket,
    unpublish,
  }) => {
    if (unpublish) return;

    const { roundMember: collMembers } = await prisma.round.findUnique({
      where: { id: round.id },
      include: {
        roundMember: {
          include: { user: { include: { emailSettings: true } } },
        },
      },
    });

    const { cocreators } = await prisma.bucket.findUnique({
      where: { id: bucket.id },
      include: { cocreators: true },
    });

    // send to all coll members who aren't cocreators to the bucket
    const usersToNotify = collMembers
      .filter(
        (collMember) => !cocreators.map((co) => co.id).includes(collMember.id)
      )
      .map((collMember) => collMember.user)
      .filter((user) => user.emailSettings?.bucketPublishedInRound ?? false);

    const collLink = appLink(`/${currentGroup.slug}/${round.slug}`);

    const emails = usersToNotify.map((user) => ({
      to: user.email,
      subject: `There is a new bucket in ${round.title}!`,
      html: `Creativity is flowing in ${escape(
        round.title
      )}! <a href="${collLink}">Have a look at the new buckets in this round.</a>
      <br/><br/>
      ${footer}
      `,
    }));

    await sendEmails(emails);
  },
  contributionToBucketNotification: async ({
    round,
    bucket,
    contributingUser,
    amount,
  }: {
    round: any;
    bucket: any;
    contributingUser: any;
    amount: number;
  }) => {
    // send to cocreators of the bucket but not the donor

    const { cocreators } = await prisma.bucket.findUnique({
      where: { id: bucket.id },
      include: {
        cocreators: { include: { user: { include: { emailSettings: true } } } },
      },
    });

    const usersToNotify = cocreators
      .filter((cocreator) => cocreator.userId !== contributingUser.id)
      .map((cocreator) => cocreator.user)
      .filter((user) => user.emailSettings?.contributionToYourBucket ?? true);

    const totalContributions = await bucketTotalContributions(bucket);
    const income = await bucketIncome(bucket);
    const minGoal = await bucketMinGoal(bucket);
    const progressPercent = Math.floor(
      ((totalContributions + income) / minGoal) * 100
    );

    const { group } = await prisma.round.findUnique({
      where: { id: round.id },
      include: { group: true },
    });

    const bucketLink = appLink(`/${group.slug}/${round.slug}/${bucket.id}`);

    const emails = usersToNotify.map((mailRecipient) => ({
      to: mailRecipient.email,
      subject: `Your bucket “${bucket.title}” received funding!`,
      html: `Hooray - your bucket <a href="${bucketLink}">“${escape(
        bucket.title
      )}”</a> just received some funds!<br/>
      ${escape(contributingUser.name)} contributed ${amount / 100} ${
        round.currency
      }<br/>
      Your bucket is now ${progressPercent}% funded!<br/>
      <br/><br/>
      ${footer}
      `,
    }));

    await sendEmails(emails);
  },
};
