import { useHelpers } from "@remirror/react";
import { MarkdownEditor } from "./MarkdownEditor";

const MarkdownPreview = () => {
  const { getMarkdown } = useHelpers(true);

  return (
    <pre>
      <code>{typeof window === "undefined" ? "" : getMarkdown()}</code>
    </pre>
  );
};

const Wysiwyg = () => {
  return (
    <MarkdownEditor placeholder="Start typing...">
      <MarkdownPreview />
    </MarkdownEditor>
  );
};

export default Wysiwyg;
