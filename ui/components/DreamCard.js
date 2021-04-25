import { stringToColor } from "../utils/stringToHslColor";
import ProgressBar from "./ProgressBar";
import Link from "next/link";
import { useMutation, gql } from "@apollo/client";

import {
  CoinIcon,
  CommentIcon,
  HeartOutlineIcon,
  HeartSolidIcon,
} from "./Icons";
import Label from "./Label";

const TOGGLE_FAVORITE_MUTATION = gql`
  mutation ToggleFavoriteMutation($dreamId: ID!) {
    toggleFavorite(dreamId: $dreamId) {
      id
      favorite
    }
  }
`;

const getDreamCustomFieldValue = (dream, customField) => {
  if (!dream.customFields || dream.customFields.length == 0) return;
  const existingField = dream.customFields.filter((field) => {
    return field.customField.id == customField.id;
  });
  if (existingField && existingField.length > 0) {
    return existingField[0].value;
  }
};

const DreamCard = ({ dream, event, currentOrgMember, filterLabels }) => {
  const [toggleFavorite, { loading }] = useMutation(TOGGLE_FAVORITE_MUTATION, {
    variables: { dreamId: dream.id },
  });
  const showFundingStats =
    (dream.minGoal || dream.maxGoal) && dream.approved && !dream.canceled;
  return (
    <div className="relative bg-white rounded-lg shadow-md overflow-hidden flex flex-col w-full hover:shadow-lg transition-shadow duration-75 ease-in-out">
      {dream.images.length ? (
        <img
          src={dream.images[0].small}
          className="w-full h-48 object-cover object-center"
        />
      ) : (
        <div className={`w-full h-48 bg-${stringToColor(dream.title)}`} />
      )}
      {!dream.published && (
        <Label className="absolute right-0 m-2">Unpublished</Label>
      )}
      <div className="p-4 pt-3 flex-grow flex flex-col justify-between">
        <div className="mb-2">
          <h3 className="text-xl font-medium mb-1 truncate">{dream.title}</h3>

          <div className="text-gray-800">
            {filterLabels ? (
              <>
                <div className="mt-1 p-2 bg-gray-100 rounded-md border border-gray-200">
                  <span className=" text-xs block font-semibold uppercase tracking-wide text-gray-600">
                    {filterLabels.name}
                  </span>
                  <div className="line-clamp-3">
                    {getDreamCustomFieldValue(dream, filterLabels)}
                  </div>
                </div>
              </>
            ) : (
              dream.summary
            )}
          </div>
        </div>
        <div>
          {showFundingStats && (
            <ProgressBar
              color={event.color}
              ratio={dream.totalContributions / dream.minGoal}
              className="mt-2 mb-3"
            />
          )}

          <div className="flex space-x-3 mt-1">
            {showFundingStats && (
              <div className="flex items-center text-gray-700">
                <CoinIcon className="w-5 h-5" />
                <span className="block ml-1 text-sm">
                  {Math.round((dream.totalContributions / dream.minGoal) * 100)}
                  %
                </span>
              </div>
            )}

            {dream.numberOfComments > 0 && (
              <Link
                href="/[event]/[dream]#comments"
                as={`/${event.slug}/${dream.id}#comments`}
              >
                <div className="flex items-center text-gray-700">
                  <CommentIcon className="w-5 h-5" />
                  <span className="block ml-1 text-sm">
                    {dream.numberOfComments}
                  </span>
                </div>
              </Link>
            )}

            {/* {currentOrgMember?.currentEventMembership && (
              <button
                className="flex items-center focus:outline-none"
                tabIndex="-1"
                disabled={loading}
                onClick={(e) => {
                  e.preventDefault();
                  if (!loading) toggleFavorite();
                }}
              >
                {dream.favorite ? (
                  <HeartSolidIcon className="w-5 h-5 text-red hover:text-red-dark" />
                ) : (
                  <HeartOutlineIcon className="w-5 h-5 text-gray-700 hover:text-red" />
                )}
              </button>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DreamCard;
