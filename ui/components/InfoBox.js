import { useState } from "react";
import ExpandButton from "components/ExpandButton";
import Markdown from "./Markdown";

const InfoBox = ({ markdown }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={
        "shadow rounded-lg mb-5 bg-white px-5 pt-4 pb-2 overflow-hidden "
      }
    >
      <div className={"relative markdown" + " " + (!expanded && "max-h-32")}>
        <Markdown source={markdown} />

        <div className="-mx-2">
          <ExpandButton expanded={expanded} setExpanded={setExpanded} />
        </div>
      </div>
    </div>
  );
};

export default InfoBox;
