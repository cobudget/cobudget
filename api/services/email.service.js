
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
  host: 'api.eu.mailgun.net',
});

const DEPLOY_URL = process.env.VERCEL_URL
  ? process.env.VERCEL_URL
  : process.env.DEPLOY_URL;

class EmailService {

  static async sendMagicLinkEmail(token, organization, user) {
    console.log({user});
    // send magic link in production, log it in development
    const { subdomain, customDomain } = organization;
    if (process.env.NODE_ENV === 'production') {
      const domain = `https://${customDomain}` || `https://${subdomain}.${DEPLOY_URL}`;
      const url = `${domain}/?token=${token}`;
      var data = {
        from: `${process.env.EMAIL_SENDER}`,
        to: user.email,
        subject: 'Login to Dreams',
        text: `Here is your link: ${url}`,
      };

      return mailgun
        .messages()
        .send(data)
        .then(() => {
          console.log('Successfully sent magic link with Mailgun');
          return true;
        })
        .catch((error) => {
          throw new Error('Failed to send magic link');
        });
    } else {
      const domain = `http://${customDomain}` || `http://${subdomain}.localhost:3000`;
      const url = `${domain}/?token=${token}`;
      console.log(`Here is your magic link: ${url}`);
      return true;
    }
  };

  static async sendRequestToJoinNotifications(user, event, emails) {
    if (process.env.NODE_ENV === 'production') {
      var data = {
        from: `${process.env.EMAIL_SENDER}`,
        to: emails,
        subject: `Request to join ${event.title}`,
        text: `${user.name} (${user.email}) is requesting to join ${event.title}. Go here to approve: https://${DEPLOY_URL}/${event.slug}/members`,
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
  };
}

module.exports = EmailService;
