import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";

// Icons.js is JSX-in-.js, which vitest's vite pipeline refuses to parse.
vi.mock("components/Icons", () => ({
  DeleteIcon: () => null,
  ChainIcon: () => null,
}));

import Wysiwyg from "components/Wysiwyg";

// jsdom has no layout engine — ProseMirror probes these during view updates.
if (!Range.prototype.getClientRects) {
  Range.prototype.getClientRects = () => ({ length: 0 } as any);
}
Range.prototype.getBoundingClientRect = () =>
  ({ top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 } as any);

// 1×1 transparent PNG
const TINY_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const DATA_URI = `data:image/png;base64,${TINY_PNG_B64}`;
const HOSTED_URL =
  "https://res.cloudinary.com/dreamswtf/image/upload/v1/dreams/test123.png";

describe("Wysiwyg inline image upload", () => {
  const realFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ secure_url: HOSTED_URL }),
    }) as any;
  });

  afterEach(() => {
    global.fetch = realFetch;
  });

  it("uploads a data-URI image from the document and swaps in the hosted URL", async () => {
    const onChange = vi.fn();
    render(
      <Wysiwyg defaultValue={`hello\n\n![](${DATA_URI})`} onChange={onChange} />
    );

    // The sweeper should find the data-URI image node and upload it…
    await waitFor(
      () => {
        expect(global.fetch).toHaveBeenCalledWith(
          "https://api.cloudinary.com/v1_1/dreamswtf/image/upload",
          expect.objectContaining({ method: "POST" })
        );
      },
      { timeout: 5000 }
    );

    // …and the emitted markdown should reference the hosted URL, not base64.
    await waitFor(
      () => {
        const lastCall = onChange.mock.calls.at(-1)?.[0];
        expect(lastCall?.target?.value).toContain(HOSTED_URL);
        expect(lastCall?.target?.value).not.toContain("data:image");
      },
      { timeout: 5000 }
    );
  });

  it("leaves regular hosted images untouched and does not upload", async () => {
    const onChange = vi.fn();
    render(
      <Wysiwyg
        defaultValue={`hello\n\n![](${HOSTED_URL})`}
        onChange={onChange}
      />
    );

    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
