import { Client, ServerClient } from "postmark";
import prisma from "./prisma";
export interface SendEmailInput {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const client =
  process.env.NODE_ENV !== "development" &&
  new Client(process.env.POSTMARK_API_TOKEN);

const broadcastClient = new ServerClient(
  process.env.POSTMARK_BROADCAST_API_TOKEN
);

// Note: mailhog SMTP client removed - we now print emails to console in development
// to avoid connection timeout delays when mailhog isn't running

const getVerifiedEmails = async (emails: string[]) => {
  return prisma.user.findMany({
    where: {
      email: { in: emails },
      verifiedEmail: true,
    },
  });
};

const send = async (mail: SendEmailInput) => {
  console.log("Sending email to", mail.to);
  if (process.env.NODE_ENV === "development") {
    // Print to console in development (skip SMTP to avoid timeout delays)
    console.log(
      `\nTo: ${mail.to}\nSubject: ${mail.subject}\n\n${
        mail.text ?? mail.html
      }\n`
    );
  } else {
    try {
      await client.sendEmail({
        From: process.env.FROM_EMAIL,
        To: mail.to,
        Subject: mail.subject,
        TextBody: mail.text,
        HtmlBody: mail.html,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
};

const sendBatch = async (mails: SendEmailInput[]) => {
  if (process.env.NODE_ENV === "development") {
    // console log emails in development
    mails.forEach((mail) => {
      console.log(
        `\nTo: ${mail.to}\nSubject: ${mail.subject}\n\n${
          mail.text ?? mail.html
        }\n`
      );
    });
  } else {
    try {
      // split into batches of 500 because of Postmark limit on emails per batch call
      const batches = [];
      for (let i = 0; i < mails.length; i += 500) {
        batches.push(mails.slice(i, i + 500));
      }

      await Promise.all(
        batches.map((batch) =>
          client.sendEmailBatch(
            batch.map((mail) => ({
              From: process.env.FROM_EMAIL,
              To: mail.to,
              Subject: mail.subject,
              TextBody: mail.text,
              HtmlBody: mail.html,
            }))
          )
        )
      );
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
};

const broadcastMail = async (mails: SendEmailInput[]) => {
  const batches = [];
  for (let i = 0; i < mails.length; i += 500) {
    batches.push(mails.slice(i, i + 500));
  }
  // Print to console in development, "sending broadcast emails to X recipients including ..." and the first 5 recipients and mail contents
  if (process.env.NODE_ENV === "development") {
    console.log(
      `Sending broadcast emails to ${mails.length} recipients including ${mails
        .slice(0, 5)
        .map((mail) => mail.to)
        .join(", ")}`
    );
    console.log(
      `\nTo: ${mails[0].to}\nSubject: ${mails[0].subject}\n\n${
        mails[0].text ?? mails[0].html
      }\n`
    );
  } else {
    // Send broadcast emails in production
    await Promise.all(
      batches.map((batch) =>
        broadcastClient.sendEmailBatch(
          batch.map((mail) => ({
            From: process.env.FROM_EMAIL,
            To: mail.to,
            Subject: mail.subject,
            TextBody: mail.text,
            HtmlBody: mail.html,
            MessageStream: "broadcast",
          }))
        )
      )
    );
  }
};

const checkEnv = () => {
  if (!process.env.FROM_EMAIL) {
    throw new Error("Add FROM_EMAIL env variable.");
  }
  if (
    process.env.NODE_ENV !== "development" &&
    !process.env.POSTMARK_API_TOKEN
  ) {
    throw new Error("Add POSTMARK_API_TOKEN env variable in production");
  }
};

export const sendEmail = async (input: SendEmailInput, verifiedOnly = true) => {
  checkEnv();
  const emailVerified = (await getVerifiedEmails([input.to])).length === 1;
  if (verifiedOnly && !emailVerified) {
    return 0;
  }
  await send(input);
  return 1;
};

export const sendEmails = async (
  inputs: SendEmailInput[],
  verifiedOnly = true,
  broadcast = false
) => {
  checkEnv();
  const batchMail = broadcast ? broadcastMail : sendBatch;
  if (verifiedOnly) {
    const verifiedEmails = (
      await getVerifiedEmails(inputs.map((input) => input.to))
    ).map((u) => u.email);
    // If there is no verified email, return
    if (verifiedEmails.length === 0) {
      return 0;
    }
    const verifiedInputs = inputs.filter(
      (input) => verifiedEmails.indexOf(input.to) > -1
    );
    await batchMail(verifiedInputs);
    return verifiedInputs.length;
  } else {
    await batchMail(inputs);
    return inputs.length;
  }
};
