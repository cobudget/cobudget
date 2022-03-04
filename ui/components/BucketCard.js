import Link from "next/link";
import { stringToColor } from "../utils/stringToHslColor";
import ProgressBar from "./ProgressBar";
import { CoinIcon, CommentIcon } from "./Icons";
import Label from "./Label";

const BucketCard = ({ bucket, round, currentGroup }) => {
  const showFundingStats =
    (bucket.minGoal || bucket.maxGoal) && bucket.approved && !bucket.canceled;
  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden flex flex-col w-full hover:shadow-lg transition-shadow duration-75 ease-in-out">
      {bucket.images?.length ? (
        <img
          src={bucket.images[0].small}
          className="w-full h-48 object-cover object-center"
        />
      ) : (
        <div className={`w-full h-48 bg-${stringToColor(bucket.title)}`} />
      )}
      {!bucket.published && (
        <Label className="absolute right-0 m-2">Unpublished</Label>
      )}
      <div className="p-4 pt-3 flex-grow flex flex-col justify-between">
        <div className="mb-2">
          <h3 className="text-xl font-medium mb-1 truncate">{bucket.title}</h3>

          <div className="text-gray-800">{bucket.summary}</div>
        </div>
        <div>
          {showFundingStats && (
            <ProgressBar
              color={round.color}
              ratio={(bucket.totalContributions + bucket.income) / bucket.minGoal}
              className="mt-2 mb-3"
            />
          )}

          <div className="flex space-x-3 mt-1">
            {showFundingStats && (
              <div className="flex items-center text-gray-700">
                <CoinIcon className="w-5 h-5" />
                <span className="block ml-1 text-sm">
                  {Math.round(
                    ((bucket.totalContributions + bucket.income) /
                      bucket.minGoal) *
                      100
                  )}
                  %
                </span>
              </div>
            )}

            {parseInt(bucket.noOfComments) > 0 && (
              <div className="flex items-center text-gray-700">
                <CommentIcon className="w-5 h-5" />
                <span className="block ml-1 text-sm">{bucket.noOfComments}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BucketCard;
