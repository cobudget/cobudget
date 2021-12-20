import { info } from "next/dist/build/output/log";
import { Client } from "postmark";
import nodemailer from "nodemailer";

//let testAccount = null;
//
//const getTestAccount = async () => {
//  if (!testAccount) testAccount = await nodemailer.createTestAccount();
//  return testAccount;
//};

export interface SendEmailInput {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const client =
  process.env.NODE_ENV === "development"
    ? nodemailer.createTransport({
        host: "localhost",
        port: 1025,
        secure: false,
      })
    : null;

const send = async (mail: SendEmailInput) => {
  if (process.env.NODE_ENV === "development") {
    console.log(
      `\nTo: ${mail.to}\nSubject: ${mail.subject}\n\n${
        mail.text ?? mail.html
      }\n`
    );

    // also sending over local smtp, set up an app like Mailhog to catch it
    await client.sendMail({
      from: process.env.FROM_EMAIL,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
  } else {
    // TODO: prod
  }
};

//const client =
//  process.env.NODE_ENV !== "development" &&
//  new Client(process.env.POSTMARK_API_TOKEN);

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
