import { describe, it, expect } from "vitest";
import { mdToHtml } from "utils/mdToHtml";

describe("mdToHtml", () => {
  it("renders markdown to HTML", async () => {
    const html = await mdToHtml(
      "# Hi\n\n**bold** and a [link](https://example.com)"
    );
    expect(html).toContain("<h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain('href="https://example.com"');
  });

  it("strips data-URI image sources (sanitizer)", async () => {
    const html = await mdToHtml("![x](data:image/png;base64,AAAA)");
    expect(html).not.toContain("data:image");
  });

  it("keeps https image sources", async () => {
    const html = await mdToHtml(
      "![x](https://res.cloudinary.com/dreamswtf/image/upload/abc.png)"
    );
    expect(html).toContain(
      'src="https://res.cloudinary.com/dreamswtf/image/upload/abc.png"'
    );
  });
});
