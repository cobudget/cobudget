import { useState } from "react";
import ReactMarkdown from "react-markdown";
import ExpandButton from "components/ExpandButton";

const InfoBox = ({ markdown, close }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={
        "shadow rounded-lg mb-5 bg-white px-5 pt-4 pb-2 overflow-hidden "
      }
    >
      <div className={"relative markdown" + " " + (!expanded && "max-h-32")}>
        <ReactMarkdown source={markdown} />

        <div className="-mx-2">
          <ExpandButton expanded={expanded} setExpanded={setExpanded} />
        </div>
      </div>
    </div>
  );
};

export default InfoBox;
