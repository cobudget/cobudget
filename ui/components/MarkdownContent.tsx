import { useEffect, useState } from "react";
import { mdToHtml } from "utils/mdToHtml";

// Renders admin-authored markdown through the same sanitizing pipeline used
// for outgoing emails, so previews match what recipients receive.
const MarkdownContent = ({
  markdown,
  className,
}: {
  markdown: string;
  className?: string;
}) => {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    mdToHtml(markdown ?? "").then((result) => {
      if (!cancelled) setHtml(result);
    });
    return () => {
      cancelled = true;
    };
  }, [markdown]);

  if (html === null) return <div className={className} />;
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
};

export default MarkdownContent;
