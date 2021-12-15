import { info } from "next/dist/build/output/log";
import { Client } from "postmark";

const client =
  process.env.NODE_ENV !== "development" &&
  new Client(process.env.POSTMARK_API_TOKEN);

export interface SendEmailInput {
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

  if (!process.env.POSTMARK_API_TOKEN || !process.env.FROM_EMAIL) {
    console.error(`Add FROM_EMAIL and POSTMARK_API_TOKEN env variables.`);
    return;
  }

  return client.sendEmail({
    From: process.env.FROM_EMAIL,
    To: input.to,
    Subject: input.subject,
    TextBody: input.text,
  });
};

export const sendEmails = (inputs: SendEmailInput[]) => {
  if (process.env.NODE_ENV === `development`) {
    info(`Logging emails not sent:`);
    inputs.forEach((input) => {
      console.log(
        `\nTo: ${input.to}\nSubject: ${input.subject}\n\n${input.text}\n`
      );
    });

    return;
  }

  if (!process.env.POSTMARK_API_TOKEN || !process.env.FROM_EMAIL) {
    console.error(`Add FROM_EMAIL and POSTMARK_API_TOKEN env variables.`);
    return;
  }

  return client.sendEmailBatch(
    inputs.map((input) => ({
      From: process.env.FROM_EMAIL,
      To: input.to,
      Subject: input.subject,
      TextBody: input.text,
    }))
  );
};
