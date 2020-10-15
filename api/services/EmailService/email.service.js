const EmailTemplates = require('./email.templates');

const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
	host: process.env.MAILGUN_HOST,
});

class EmailService {
  static async sendMagicLinkEmail(token, organization, user) {
    // send magic link in production, log it in development
    const { subdomain, customDomain, name } = organization;
    if (process.env.NODE_ENV === 'production') {
      const domain = customDomain
        ? `https://${customDomain}`
        : `https://${subdomain}.${process.env.DEPLOY_URL}`;

      const url = `${domain}/?token=${token}`;
      const loginTemplate = await EmailTemplates.getLoginTemplate(organization, url, domain);
      const data = {
        from: `${process.env.EMAIL_SENDER}`,
        to: user.email,
        subject: `Welcome to Dreams - ${name}`,
        html: loginTemplate
      };

      return mailgun
        .messages()
        .send(data)
        .then(() => {
          console.log('Successfully sent magic link with Mailgun');
          return true;
        })
        .catch((error) => {
          console.error(error);
          throw new Error(`Failed to send magic link ${error.message}`);
        });
    } else {
      const domain = customDomain
        ? `http://${customDomain}`
        : `http://${subdomain}.localhost:3000`;
      const url = `${domain}/?token=${token}`;
      console.log(`Here is your magic link: ${url}`);
      return true;
    }
  }

  static async sendRequestToJoinNotifications(
    organization,
    user,
    event,
    emails
  ) {
    const { subdomain, customDomain } = organization;
    if (process.env.NODE_ENV === 'production') {
      const domain = customDomain
        ? `https://${customDomain}`
        : `https://${subdomain}.${process.env.DEPLOY_URL}`;
      
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
          console.log('Successfully sent request to join');
          return true;
        })
        .catch((error) => {
          console.error({ error });
          throw new Error(error.message);
        });
    } else {
      console.log('in development, not sending request to join notifications');
    }
  }
}

module.exports = EmailService;
