// Postmark limits batch calls to 500 messages AND ~50MB of request payload.
// Chunking by count alone made large bodies (e.g. an email with an inlined
// image sent to hundreds of recipients) blow the payload cap, so chunks are
// bounded by both count and estimated size.

export interface EmailLike {
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
}

export const POSTMARK_MAX_BATCH_MESSAGES = 500;
// Postmark's hard limit is 50MB; leave headroom for the HTML document wrapper
// and JSON encoding overhead.
export const POSTMARK_MAX_BATCH_BYTES = 30 * 1024 * 1024;

// JSON keys, From/To fields, and the ~2KB HTML wrapper added at send time.
const PER_MESSAGE_OVERHEAD_BYTES = 3000;

export const approxEmailBytes = (mail: EmailLike): number =>
  (mail.to?.length ?? 0) +
  (mail.subject?.length ?? 0) +
  (mail.text?.length ?? 0) +
  (mail.html?.length ?? 0) +
  PER_MESSAGE_OVERHEAD_BYTES;

export function chunkEmailsForPostmark<T extends EmailLike>(
  mails: T[]
): T[][] {
  const chunks: T[][] = [];
  let current: T[] = [];
  let currentBytes = 0;

  for (const mail of mails) {
    const size = approxEmailBytes(mail);
    if (
      current.length > 0 &&
      (current.length >= POSTMARK_MAX_BATCH_MESSAGES ||
        currentBytes + size > POSTMARK_MAX_BATCH_BYTES)
    ) {
      chunks.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(mail);
    currentBytes += size;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}
