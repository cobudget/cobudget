import dayjs from "dayjs";

import { FlagIcon } from "components/Icons";

const CommentsLog = ({ log }) => {
  let headline;

  switch (log.type) {
    case "FlagRaised":
      headline = (
        <>
          Bucket was flagged for violating the{" "}
          <span className="underline">{log.details.guideline.title}</span>{" "}
          guideline:
        </>
      );
      break;
    case "FlagResolved":
      headline = (
        <>
          Flag for{" "}
          <span className="underline">{log.details.guideline.title}</span>{" "}
          guideline was resolved:
        </>
      );
      break;
  }

  return (
    <div className="flex my-4">
      <div className="mr-4">
        <div className="bg-gray-100 text-gray-700 rounded-full h-10 w-10 flex items-center justify-center">
          <FlagIcon className="h-5 w-5" />
        </div>
      </div>
      <div className={`flex-grow border-b pb-4`}>
        <div className="flex justify-between items-center mb-2 text-gray-900 font-medium text-sm">
          <h5 className="text-gray-700">{headline}</h5>
          <div className="flex items-center">
            <span className="font-normal mr-2">
              {dayjs(log.createdAt).fromNow()}
            </span>
          </div>
        </div>

        <p className="text-gray-900 whitespace-pre-line">
          {log.details.comment}
        </p>
      </div>
    </div>
  );
};

export default CommentsLog;
