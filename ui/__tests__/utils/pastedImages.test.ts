import { describe, it, expect } from "vitest";
import { dataUriToFile } from "utils/pastedImages";

// 1×1 transparent PNG
const TINY_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

describe("dataUriToFile", () => {
  it("converts a base64 image data URI to a File", () => {
    const file = dataUriToFile(`data:image/png;base64,${TINY_PNG_B64}`);
    expect(file).not.toBeNull();
    expect(file!.type).toBe("image/png");
    expect(file!.name).toBe("pasted-image.png");
    expect(file!.size).toBe(atob(TINY_PNG_B64).length);
  });

  it("handles jpeg mime and a custom base name", () => {
    const file = dataUriToFile("data:image/jpeg;base64,/9j/4AAQ", "photo");
    expect(file).not.toBeNull();
    expect(file!.type).toBe("image/jpeg");
    expect(file!.name).toBe("photo.jpeg");
  });

  it("decodes percent-encoded non-base64 URIs", () => {
    const file = dataUriToFile("data:text/plain,hello%20world");
    expect(file).not.toBeNull();
    expect(file!.type).toBe("text/plain");
    expect(file!.size).toBe("hello world".length);
  });

  it("gives svg+xml a clean file extension", () => {
    const file = dataUriToFile("data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=");
    expect(file).not.toBeNull();
    expect(file!.name).toBe("pasted-image.svg");
  });

  it("returns null for invalid input", () => {
    expect(dataUriToFile("not-a-data-uri")).toBeNull();
    expect(dataUriToFile("data:image/png;base64,!!!not-base64!!!")).toBeNull();
  });
});
