import { describe, it, expect } from "vitest";
import {
  approxEmailBytes,
  chunkEmailsForPostmark,
  POSTMARK_MAX_BATCH_BYTES,
  POSTMARK_MAX_BATCH_MESSAGES,
} from "server/email-batching";

const mail = (overrides: Record<string, string> = {}) => ({
  to: "someone@example.com",
  subject: "Hello",
  text: "Hi there",
  html: "<p>Hi there</p>",
  ...overrides,
});

describe("chunkEmailsForPostmark", () => {
  it("keeps small batches in a single chunk", () => {
    const chunks = chunkEmailsForPostmark([mail(), mail(), mail()]);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toHaveLength(3);
  });

  it("splits by the 500-message limit", () => {
    const mails = Array.from({ length: 1200 }, () => mail());
    const chunks = chunkEmailsForPostmark(mails);
    expect(chunks.map((c) => c.length)).toEqual([500, 500, 200]);
  });

  it("splits by payload size for large bodies", () => {
    // ~6MB per message → far fewer than 500 per chunk
    const big = "x".repeat(6 * 1024 * 1024);
    const mails = Array.from({ length: 10 }, () =>
      mail({ html: big, text: "" })
    );
    const chunks = chunkEmailsForPostmark(mails);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(POSTMARK_MAX_BATCH_MESSAGES);
      const bytes = chunk.reduce((sum, m) => sum + approxEmailBytes(m), 0);
      expect(bytes).toBeLessThanOrEqual(POSTMARK_MAX_BATCH_BYTES);
    }
    // nothing lost, order preserved
    expect(chunks.flat()).toEqual(mails);
  });

  it("emits an oversized single message as its own chunk", () => {
    const huge = mail({ html: "x".repeat(60 * 1024 * 1024) });
    const chunks = chunkEmailsForPostmark([mail(), huge, mail()]);
    expect(chunks.flat()).toHaveLength(3);
    const hugeChunk = chunks.find((c) => c.includes(huge));
    expect(hugeChunk).toHaveLength(1);
  });

  it("keeps every chunk under the payload cap for the 2026-07-29 incident shape", () => {
    // 588 recipients × ~115KB markdown body (pasted base64 image), sent as
    // both text and html — the combination that exceeded Postmark's limit
    // when chunked by count alone.
    const body = "y".repeat(115_466);
    const mails = Array.from({ length: 588 }, () =>
      mail({ text: body, html: body })
    );
    const chunks = chunkEmailsForPostmark(mails);
    for (const chunk of chunks) {
      const bytes = chunk.reduce((sum, m) => sum + approxEmailBytes(m), 0);
      expect(bytes).toBeLessThanOrEqual(POSTMARK_MAX_BATCH_BYTES);
    }
    expect(chunks.flat()).toHaveLength(588);
  });
});
