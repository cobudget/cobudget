import nodemailer from "nodemailer";
import postmarkTransport from "nodemailer-postmark-transport";

export interface SendEmailInput {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// in dev we send over local smtp, set up an app like Mailhog to catch it
const client =
  process.env.NODE_ENV === "development"
    ? nodemailer.createTransport({
        host: "localhost",
        port: 1025,
        secure: false,
      })
    : nodemailer.createTransport(
        postmarkTransport({
          auth: {
            apiKey: process.env.POSTMARK_API_TOKEN,
          },
        })
      );

const send = async (mail: SendEmailInput) => {
  if (process.env.NODE_ENV === "development") {
    console.log(
      `\nTo: ${mail.to}\nSubject: ${mail.subject}\n\n${
        mail.text ?? mail.html
      }\n`
    );
  }

  await client.sendMail({
    from: process.env.FROM_EMAIL,
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });
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
  await Promise.all(inputs.map((mail) => send(mail)));
};
