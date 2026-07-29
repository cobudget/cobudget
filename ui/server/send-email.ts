import { Client, ServerClient } from "postmark";
import { LinkTrackingOptions } from "postmark/dist/client/models";
import prisma from "./prisma";
import { chunkEmailsForPostmark } from "./email-batching";
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

function wrapHtml(bodyHtml: string): string {
  // Don't double-wrap if already a full HTML document
  if (bodyHtml.trim().toLowerCase().startsWith("<!doctype") || bodyHtml.trim().toLowerCase().startsWith("<html")) {
    return bodyHtml;
  }
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <!--[if mso]>
  <style>* { font-family: sans-serif !important; }</style>
  <![endif]-->
  <style>
    :root { color-scheme: light; supported-color-schemes: light; }
    html, body { margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important; }
    * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
    div[style*="margin: 16px 0"] { margin: 0 !important; }
    table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }
    table { border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto !important; }
    a { color: #1a73e8; }
    img { -ms-interpolation-mode: bicubic; }
    .im { color: inherit !important; }
    @media screen and (max-width: 600px) {
      .email-container p { font-size: 16px !important; }
    }
  </style>
</head>
<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f4f4f5;">
  <center role="article" aria-roledescription="email" lang="en" style="width: 100%; background-color: #f4f4f5;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);" class="email-container">
      <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 32px 36px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px; color: #333333;">
            ${bodyHtml}
          </td>
        </tr>
      </table>
    </div>
  </center>
</body>
</html>`;
}

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

// Sends messages through Postmark's batch API in chunks bounded by both
// Postmark limits (500 messages, ~50MB per request). Sequential on purpose:
// a mid-way failure leaves a clear log of which chunk failed. Postmark
// resolves the promise even when individual messages are rejected, so
// per-message ErrorCodes are checked and logged too.
const sendPostmarkBatches = async (
  pmClient: {
    sendEmailBatch: (
      messages: unknown[]
    ) => Promise<{ ErrorCode: number; Message: string; To?: string }[]>;
  },
  mails: SendEmailInput[],
  toMessage: (mail: SendEmailInput) => Record<string, unknown>
) => {
  const batches = chunkEmailsForPostmark(mails);
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    try {
      const results = await pmClient.sendEmailBatch(batch.map(toMessage));
      const rejected = (results ?? []).filter((r) => r.ErrorCode !== 0);
      if (rejected.length > 0) {
        console.error(
          `Postmark rejected ${rejected.length}/${batch.length} messages in batch ${
            i + 1
          }/${batches.length}:`,
          rejected.slice(0, 3)
        );
      }
    } catch (err) {
      console.error(
        `Postmark batch ${i + 1}/${batches.length} failed (${
          batch.length
        } messages):`,
        err
      );
      throw err;
    }
  }
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
        HtmlBody: mail.html ? wrapHtml(mail.html) : undefined,
        TrackOpens: false,
        TrackLinks: LinkTrackingOptions.None,
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
    await sendPostmarkBatches(client, mails, (mail) => ({
      From: process.env.FROM_EMAIL,
      To: mail.to,
      Subject: mail.subject,
      TextBody: mail.text,
      HtmlBody: mail.html ? wrapHtml(mail.html) : undefined,
      TrackOpens: false,
      TrackLinks: LinkTrackingOptions.None,
    }));
  }
};

const broadcastMail = async (mails: SendEmailInput[]) => {
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
    await sendPostmarkBatches(broadcastClient, mails, (mail) => ({
      From: process.env.FROM_EMAIL,
      To: mail.to,
      Subject: mail.subject,
      TextBody: mail.text,
      HtmlBody: mail.html ? wrapHtml(mail.html) : undefined,
      MessageStream: "broadcast",
    }));
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
