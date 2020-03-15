import stringToHslColor from "../utils/stringToHslColor";
import ProgressBar from "./ProgressBar";
import Link from "next/link";

import { CoinIcon, CommentIcon } from "./Icons";

export default ({ dream }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col w-full hover:shadow-lg transition-shadow duration-75 ease-in-out">
      {dream.images.length ? (
        <img
          src={dream.images[0].small}
          className="w-full h-48 object-cover object-center"
        />
      ) : (
        <div
          className="w-full h-48"
          style={{ background: stringToHslColor(dream.title) }}
        />
      )}
      <div className="p-4 pt-3 flex-grow flex flex-col justify-between">
        <div className="mb-2">
          <h3 className="text-xl font-medium mb-1 truncate">{dream.title}</h3>

          <p className="text-gray-800">{dream.summary}</p>
        </div>
        <div>
          {(dream.minGoalGrants || dream.maxGoalGrants) && (
            <ProgressBar
              currentNumberOfGrants={dream.currentNumberOfGrants}
              minGoalGrants={dream.minGoalGrants}
              maxGoalGrants={dream.maxGoalGrants}
            />
          )}

          <div className="flex mt-1">
            {(dream.minGoalGrants || dream.maxGoalGrants) && (
              <div className="mr-3 flex items-center text-gray-700 hover:text-green-700">
                <CoinIcon className="w-5 h-5" />
                <span className="block ml-1">
                  {dream.currentNumberOfGrants}/
                  {dream.maxGoalGrants || dream.minGoalGrants}
                </span>
              </div>
            )}

            <Link href="/[dream]#comments" as={`/${dream.slug}#comments`}>
              <div className="flex items-center text-gray-700 hover:text-blue-700">
                <CommentIcon className="w-5 h-5" />
                <span className="block ml-1">{dream.numberOfComments} </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
