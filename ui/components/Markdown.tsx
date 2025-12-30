import ReactMarkdown from "react-markdown";
import Link from "next/link";
import remarkGfm from "remark-gfm";
import { appLink } from "utils/internalLinks";

const Markdown = ({ source, enableMentions = false, className = "" }) => {
  return (
    <ReactMarkdown
      className={"markdown " + className}
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => {
          if (href?.startsWith(appLink("/user/")) && enableMentions) {
            return (
              <Link href={href} className="markdownMention">
                {children}
              </Link>
            );
          } else if (href?.startsWith("http")) {
            return (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
              </a>
            );
          } else {
            return <Link href={href || "#"}>{children}</Link>;
          }
        },
        code: ({ children, className, ...props }) => (
          <code className={`whitespace-pre-wrap ${className || ""}`} {...props}>
            {children}
          </code>
        ),
      }}
    >
      {source}
    </ReactMarkdown>
  );
};

export default Markdown;
