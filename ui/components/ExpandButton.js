import { CheveronDownIcon, CheveronUpIcon } from "./Icons";

const ExpandButton = ({ expanded, setExpanded, className }) => {
  return (
    <div
      className={`block ${
        !expanded && "expand-gradient absolute bottom-0 right-0 left-0"
      } ${className}`}
    >
      <button
        className="hover:bg-gray-100 p-1 w-full h-full rounded flex justify-center focus:outline-none opacity-75"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <CheveronUpIcon className="h-8 w-8 p-1 text-gray-900 bg-gray-100 rounded-full" />
        ) : (
          <CheveronDownIcon className="h-8 w-8 p-1 text-gray-900 bg-gray-100 rounded-full" />
        )}
      </button>
    </div>
  );
};

export default ExpandButton;
