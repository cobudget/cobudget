import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { CloseIcon, CheveronDownIcon, CheveronUpIcon } from "./Icons";

export default ({ markdown, close }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="shadow relative z-50 rounded-lg mt-2 mb-5 bg-white px-5 pt-4 pb-10 overflow-hidden markdown"
      style={!expanded ? { maxHeight: 90 } : {}}
    >
      <button className="absolute right-0 top-0 m-4" onClick={close}>
        <CloseIcon className="w-6 h-6" />
      </button>

      <ReactMarkdown source={markdown} />

      <div
        className={`absolute p-2 block bottom-0 right-0 left-0 ${
          !expanded ? "expand-gradient" : ""
        }`}
      >
        <button
          className="hover:bg-gray-100 p-1 block w-full h-full rounded flex justify-center focus:outline-none opacity-75"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <CheveronUpIcon className="h-8 w-8 p-1 text-gray-900 bg-gray-100 rounded-full" />
          ) : (
            <CheveronDownIcon className="h-8 w-8 p-1 text-gray-900 bg-gray-100 rounded-full" />
          )}
        </button>
      </div>
    </div>
  );
};
