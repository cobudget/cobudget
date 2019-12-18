const { generateLoginJWT } = require('./auth');
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: 'dreams.wtf',
  host: 'api.eu.mailgun.net'
});

const sendMagicLinkEmail = async (member, event) => {
  // send magic link in production, log it in development
  const token = await generateLoginJWT(member);

  if (process.env.NODE_ENV === 'production') {
    const url = `https://${event.slug}.dreams.wtf/?token=${token}`;
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
    const url = `http://${event.slug}.localhost:3000/?token=${token}`;
    console.log(`Here is your magic link: ${url}`);
    return true;
  }
};

const sendInviteEmails = async (members, event) => {
  const emails = members.map(member => member.email);

  const recipientVars = await members.reduce(async (obj, member) => {
    return {
      ...(await obj),
      [member.email]: { token: await generateLoginJWT(member) }
    };
  }, {});

  if (process.env.NODE_ENV === 'production') {
    var data = {
      from: 'Dreams <wizard@dreams.wtf>',
      to: emails,
      subject: `You are invited to Dreams for ${event.title}`,
      'recipient-variables': recipientVars,
      text: `Here is your log in link: https://${event.slug}.dreams.wtf/?token=%recipient.token%`
    };
    return mailgun
      .messages()
      .send(data)
      .then(() => {
        console.log('Successfully sent invites');
        return true;
      })
      .catch(error => {
        console.log({ error });
        throw new Error(error.message);
      });
  } else {
    console.log('In development, not sending invite emails.');
    console.log(recipientVars);
  }
};

const sendRequestToJoinNotifications = async (member, event, admins) => {
  if (process.env.NODE_ENV === 'production') {
    const emails = admins.map(admin => admin.email);
    var data = {
      from: 'Dreams <wizard@dreams.wtf>',
      to: emails,
      subject: `Request to join ${event.title}`,
      text: `${member.email} is requesting to join ${event.title}. Go here to approve: https://${event.slug}.dreams.wtf/admin`
    };
    return mailgun
      .messages()
      .send(data)
      .then(() => {
        console.log('Successfully sent request to join');
        return true;
      })
      .catch(error => {
        console.log({ error });
        throw new Error(error.message);
      });
  } else {
    console.log('in development, not sending request to join notifications');
  }
};

module.exports = {
  sendMagicLinkEmail,
  sendInviteEmails,
  sendRequestToJoinNotifications
};
