import { info } from "next/dist/build/output/log";
import { Client } from "postmark";

const client = new Client(process.env.POSTMARK_API_TOKEN);

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
}

export const sendEmail = (input: SendEmailInput) => {
  if (process.env.NODE_ENV === `development`) {
    info(`Logging email not sent:`);
    console.log(
      `\nTo: ${input.to}\nSubject: ${input.subject}\n\n${input.text}\n`
    );

    return;
  }

  if (!process.env.POSTMARK_API_TOKEN || !process.env.POSTMARK_FROM_EMAIL) {
    console.error(
      `Add POSTMARK_FROM_EMAIL and POSTMARK_API_TOKEN env variables.`
    );
    return;
  }

  return client.sendEmail({
    From: process.env.POSTMARK_FROM_EMAIL,
    To: input.to,
    Subject: input.subject,
    TextBody: input.text,
  });
};
