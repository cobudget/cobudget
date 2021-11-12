import { info } from "next/dist/build/output/log";
import { Client } from "postmark";

const client =
  process.env.NODE_ENV !== "development" &&
  new Client(process.env.POSTMARK_API_TOKEN);

interface SendEmailInput {
  to: string | string[];
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

  if (!process.env.POSTMARK_API_TOKEN || !process.env.FROM_EMAIL) {
    console.error(`Add FROM_EMAIL and POSTMARK_API_TOKEN env variables.`);
    return;
  }

  if (typeof input.to === "string") {
    return client.sendEmail({
      From: process.env.FROM_EMAIL,
      To: input.to,
      Subject: input.subject,
      TextBody: input.text,
    });
  }

  return client.sendEmailBatch(
    input.to.map((to) => ({
      From: process.env.FROM_EMAIL,
      To: to,
      Subject: input.subject,
      TextBody: input.text,
    }))
  );
};
