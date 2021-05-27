const mailgun = require("mailgun-js")({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
  host: process.env.MAILGUN_HOST,
});

const createDomain = (org) =>
  org.customDomain
    ? `https://${org.customDomain}`
    : `https://${org.subdomain}.${process.env.DEPLOY_URL}`;

class EmailService {
  static async sendCommentNotification({
    dream,
    models: { EventMember, OrgMember },
    kcAdminClient,
    event,
    currentOrg,
    currentOrgMember,
    comment,
  }) {
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
      if (orgMember.id !== currentOrgMember.id) emails.push(email);
    });

    const { username } = await kcAdminClient.users.findOne({
      id: currentOrgMember.userId,
    });

    const link = `${createDomain(currentOrg)}/${event.slug}/${dream.id}`;
    const subject = `${username} commented on ${dream.title}`;
    const text = `"${comment.content}"\n\nGo here to reply: ${link}`;

    await this.sendEmail(emails, subject, text);
  }

  static async sendEmail(emails, subject, text) {
    if (process.env.NODE_ENV === "production" && emails.length) {
      const data = {
        from: `${process.env.EMAIL_SENDER}`,
        to: emails,
        subject,
        text,
      };
      return mailgun
        .messages()
        .send(data)
        .then(() => {
          console.log("Successfully sent emails");
          return true;
        })
        .catch((error) => {
          console.error({ error });
          throw new Error(error.message);
        });
    } else {
      console.log(`In development, not sending ${emails.length} emails`);
    }
  }

  static async sendRequestToJoinNotifications(
    organization,
    user,
    event,
    emails
  ) {
    if (process.env.NODE_ENV === "production") {
      const domain = createDomain(organization);

      var data = {
        from: `${process.env.EMAIL_SENDER}`,
        to: emails,
        subject: `Request to join ${event.title}`,
        text: `${user.name} (${user.email}) is requesting to join ${event.title}. Go here to approve: ${domain}/${event.slug}/members`,
      };
      return mailgun
        .messages()
        .send(data)
        .then(() => {
          console.log("Successfully sent request to join");
          return true;
        })
        .catch((error) => {
          console.error({ error });
          throw new Error(error.message);
        });
    } else {
      console.log("in development, not sending request to join notifications");
    }
  }
}

module.exports = EmailService;
