import ReactMarkdown from "react-markdown";
import Link from "next/link";

const Markdown = ({ source, className = "" }) => {
  return (
    <ReactMarkdown
      source={source}
      className={"markdown " + className}
      renderers={{
        link: (props) => {
          if (props.href.includes("http"))
            return (
              <a href={props.href} target="_blank" rel="noreferrer">
                {props.children}
              </a>
            );
          return (
            <Link href={props.href}>
              <a>{props.children}</a>
            </Link>
          );
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
