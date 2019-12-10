const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: 'dreams.wtf',
  host: 'api.eu.mailgun.net'
});

export const sendMagicLinkEmail = async (member, token, event) => {
  // send magic link in production, log it in development
  if (process.env.NODE_ENV === 'production') {
    const url = `https://${event.slug}.dreams.wtf/login?token=${token}`;
    var data = {
      from: 'Dreams <wizard@dreams.wtf>', // send from subdomain?
      to: member.email,
      subject: 'Login to Dreams',
      text: `Here is your link: ${url}`
    };

    return mailgun
      .messages()
      .send(data)
      .then(() => {
        console.log('Successfully sent magic link with Mailgun');
        return true;
      })
      .catch(error => {
        throw new Error('Failed to send magic link');
      });
  } else {
    const url = `http://${event.slug}.localhost:3000/login?token=${token}`;
    console.log(`Here is your magic link: ${url}`);
    return true;
  }
};
