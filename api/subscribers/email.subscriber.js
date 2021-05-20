const EmailService = require("../services/EmailService/email.service");
const orgHasDiscourse = (org) => org.discourse.url && org.discourse.apiKey;

module.exports = {
  initialize(eventHub, { EventMember, OrgMember }, kcAdminClient) {
    eventHub.subscribe(
      "create-comment",
      async ({ currentOrg, currentOrgMember, event, dream, comment }) => {
        const cocreatorEventMemberIds = dream.cocreators;

        const eventMembers = await EventMember.find({
          _id: { $in: cocreatorEventMemberIds },
        });

        const orgMemberIds = eventMembers.map((member) => member.orgMemberId);
        const orgMembers = await OrgMember.find({ _id: { $in: orgMemberIds } });

        const emails = [];
        orgMembers.forEach(async (orgMember) => {
          const { email } = await kcAdminClient.users.findOne({
            id: orgMember.userId,
          });
          emails.push(email);
        });

        const domain = currentOrg.customDomain
          ? `https://${currentOrg.customDomain}`
          : `https://${currentOrg.subdomain}.${process.env.DEPLOY_URL}`;

        const link = `${domain}/${event.slug}/${dream.id}`;
        const subject = `New comment on ${dream.title}`;
        console.log({ comment });
        const text = `${comment.authorId} added a comment on your Dream: ${link}`;

        await EmailService.sendEmail(emails, subject, text);
      }
    );
  },
};
