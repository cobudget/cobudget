import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

// Single markdown → sanitized-HTML pipeline, shared by server-side email
// rendering (freud.ts, email.service.ts) and client-side previews so that
// what admins preview is what recipients receive.
const mdToHtmlConverter = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeStringify);

export async function mdToHtml(md: string): Promise<string> {
  return String(await mdToHtmlConverter.process(md));
}
