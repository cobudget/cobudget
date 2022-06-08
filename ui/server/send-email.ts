import nodemailer from "nodemailer";
import { Client } from "postmark";
export interface SendEmailInput {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const client =
  process.env.NODE_ENV !== "development" &&
  new Client(process.env.POSTMARK_API_TOKEN);

const smtpClient =
  process.env.NODE_ENV === "development" &&
  nodemailer.createTransport({
    host: "localhost",
    port: 1025,
    secure: false,
  });

const send = async (mail: SendEmailInput) => {
  if (process.env.NODE_ENV === "development") {
    try {
      await smtpClient.sendMail({
        from: process.env.FROM_EMAIL,
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });
    } catch {
      // if mailhog isn't running, print it to the terminal instead
      console.log(
        `\nTo: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text ?? mail.html
        }\n`
      );
    }
  } else {
    client.sendEmail({
      From: process.env.FROM_EMAIL,
      To: mail.to,
      Subject: mail.subject,
      TextBody: mail.text,
      HtmlBody: mail.html,
    }).then(data => {
      console.log("Email successful");
    }).catch(err => {
      console.log(err);
      throw err;
    });
  }
};

const sendBatch = async (mails: SendEmailInput[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(
      "Not sending " + mails.length + " emails in development (batch)"
    );
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

export const sendEmail = async (input: SendEmailInput) => {
  checkEnv();
  await send(input);
};

export const sendEmails = async (inputs: SendEmailInput[]) => {
  checkEnv();
  await sendBatch(inputs);
};
