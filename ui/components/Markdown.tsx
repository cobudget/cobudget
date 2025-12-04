import ReactMarkdown from "react-markdown";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import { appLink } from "utils/internalLinks";
import parseMDSource from "utils/parseMDSource";

const Markdown = ({ source, enableMentions = false, className = "" }) => {
  return (
    <ReactMarkdown
      source={source}
      className={"markdown " + className}
      plugins={[remarkGfm as any]}
      renderers={{
        link: (props: { href: string; children: any }) => {
          if (props.href.startsWith(appLink("/user/")) && enableMentions) {
            return (
              <Link href={props.href}>
                <a className="markdownMention">{props.children}</a>
              </Link>
            );
          } else if (props.href.startsWith("http")) {
            return (
              <a href={props.href} target="_blank" rel="noreferrer">
                {props.children}
              </a>
            );
          } else {
            return (
              <Link href={props.href}>
                <a>{props.children}</a>
              </Link>
            );
          }
        },
        // eslint-disable-next-line no-unused-vars
        code: ({ node, ...props }) => (
          <code className="whitespace-pre-wrap" {...props}>
            {props.value}
          </code>
        ),
      }}
    />
  );
};

export default Markdown;
