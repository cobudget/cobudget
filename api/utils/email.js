const { generateLoginJWT } = require('./auth');
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.DOMAIN,
  host: 'api.eu.mailgun.net',
});

const sendMagicLinkEmail = async (user) => {
  // send magic link in production, log it in development
  const token = await generateLoginJWT(user);

  if (process.env.NODE_ENV === 'production') {
    const url = `${process.env.DEPLOY_URL}/?token=${token}`;
    var data = {
      from: `${process.env.EMAIL_SENDER}`,// send from subdomain?
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
    const url = `http://localhost:3000/?token=${token}`;
    console.log(`Here is your magic link: ${url}`);
    return true;
  }
};

// const sendInviteEmails = async (members, event) => {
//   const emails = members.map((member) => member.email);

//   const recipientVars = await members.reduce(async (obj, member) => {
//     return {
//       ...(await obj),
//       [member.email]: { token: await generateLoginJWT(member) },
//     };
//   }, {});

//   if (process.env.NODE_ENV === 'production') {
//     var data = {
//       from: ${process.env.EMAIL_SENDER},
//       to: emails,
//       subject: `You are invited to Dreams for ${event.title}`,
//       'recipient-variables': recipientVars,
//       text: `Here is your log in link: https://${event.slug}.dreams.wtf/?token=%recipient.token%`,
//     };
//     return mailgun
//       .messages()
//       .send(data)
//       .then(() => {
//         console.log('Successfully sent invites');
//         return true;
//       })
//       .catch((error) => {
//         console.log({ error });
//         throw new Error(error.message);
//       });
//   } else {
//     console.log('In development, not sending invite emails.');
//     console.log(recipientVars);
//   }
// };

const sendRequestToJoinNotifications = async (user, event, emails) => {
  if (process.env.NODE_ENV === 'production') {
    var data = {
      from: `${process.env.EMAIL_SENDER}`,
      to: emails,
      subject: `Request to join ${event.title}`,  
      text: `${user.name} (${user.email}) is requesting to join ${event.title}. Go here to approve: ${process.env.DEPLOY_URL}/${event.slug}/admin`,
    };
    return mailgun
      .messages()
      .send(data)
      .then(() => {
        console.log('Successfully sent request to join');
        return true;
      })
      .catch((error) => {
        console.log({ error });
        throw new Error(error.message);
      });
  } else {
    console.log('in development, not sending request to join notifications');
  }
};

module.exports = {
  sendMagicLinkEmail,
  // sendInviteEmails,
  sendRequestToJoinNotifications,
};
