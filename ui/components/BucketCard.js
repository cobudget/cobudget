import { useRouter } from "next/router";
import { FormattedMessage, FormattedNumber, useIntl } from "react-intl";
import getStatusColor from "utils/getStatusColor";
import { stringToColor } from "../utils/stringToHslColor";
import { CoinIcon, CommentIcon } from "./Icons";
import Label from "./Label";
import ProgressBar from "./ProgressBar";

const BucketCard = ({ bucket, round, showRound = false }) => {
  const intl = useIntl();
  const router = useRouter();

  const statusList = {
    PENDING_APPROVAL: intl.formatMessage({
      defaultMessage: "Draft",
    }),
    IDEA: intl.formatMessage({
      defaultMessage: "Idea",
    }),
    OPEN_FOR_FUNDING: intl.formatMessage({ defaultMessage: "Funding" }),
    FUNDED: intl.formatMessage({ defaultMessage: "Funded" }),
    PARTIAL_FUNDING: intl.formatMessage({ defaultMessage: "Partial Funding" }),
    CANCELED: intl.formatMessage({ defaultMessage: "Canceled" }),
    COMPLETED: intl.formatMessage({ defaultMessage: "Completed" }),
    ARCHIVED: intl.formatMessage({ defaultMessage: "Archived" }),
  };

  // Use these to detect if funding has ended and if there is an awarded amount:
  const fundingHasEnded = ["FUNDED", "PARTIAL_FUNDING", "COMPLETED"].includes(
    bucket.status
  );
  const hasAwardedAmount = bucket.awardedAmount > 0;

  // Show the usual progress bar, etc. only if round not ended
  const showFundingStats =
    !!(bucket.minGoal || bucket.maxGoal) &&
    bucket.approved &&
    !bucket.canceled &&
    !fundingHasEnded &&
    !round.grantingHasClosed;

  console.log("round", round);

  return (
    <div
      data-testid="bucket-card"
      className="relative bg-white rounded-lg shadow-md overflow-hidden flex flex-col w-full hover:shadow-lg transition-shadow duration-75 ease-in-out"
    >
      {bucket.images?.length ? (
        <img
          src={bucket.images[0].small}
          className="w-full h-48 object-cover object-center"
          alt="Bucket cover"
        />
      ) : (
        <div className={`w-full h-48 bg-${stringToColor(bucket.title)}`} />
      )}

      {!bucket.published ? (
        <Label className="absolute right-0 m-2 bg-app-gray">
          <FormattedMessage defaultMessage="Draft" />
        </Label>
      ) : (
        <Label
          className={
            "absolute right-0 m-2 " + getStatusColor(bucket.status, bucket)
          }
        >
          {statusList[bucket.status]}
        </Label>
      )}

      <div className="p-4 pt-3 flex-grow flex flex-col justify-between">
        <div className="mb-2">
          {showRound && (
            <span
              className="font-semibold my-1 text-gray-600 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                const link = round.group
                  ? `/${round.group.slug}/${round.slug}`
                  : `/c/${round.slug}`;
                router.push(link);
              }}
            >
              <p className="text-sm">
                {round.group ? (
                  <>
                    <b className="font-bold">{round.group.name}</b>{" "}
                    <span className="text-xs"> | </span> {round.title}
                  </>
                ) : (
                  round.title
                )}
              </p>
            </span>
          )}

          <h3 className="text-xl font-medium mb-1 truncate">{bucket.title}</h3>
          <div className="text-gray-800">{bucket.summary}</div>
        </div>

        {/* Funding / awarding area */}
        <div>
          {/* 1) If the round is still ongoing, show the progress bar */}
          {showFundingStats && (
            <ProgressBar
              color={round.color}
              ratio={bucket.totalContributions / bucket.minGoal}
              className="mt-2 mb-3"
            />
          )}

          <div className="flex gap-x-3 mt-1 items-center">
            {/* 2) Show % funded if progress bar is visible */}
            {showFundingStats && (
              <div className="flex items-center text-gray-700">
                <CoinIcon className="w-5 h-5" />
                <span className="block ml-1 text-sm">
                  {Math.floor(
                    (bucket.totalContributions / bucket.minGoal) * 100
                  )}
                  %
                </span>
              </div>
            )}

            {/* 3) Show comment count if > 0 */}
            {parseInt(bucket.noOfComments) > 0 && (
              <div className="flex items-center text-gray-700">
                <CommentIcon className="w-5 h-5" />
                <span className="block ml-1 text-sm">
                  {bucket.noOfComments}
                </span>
              </div>
            )}

            {/* 4a) If still in funding, show minGoal as normal */}
            {showFundingStats && (
              <span className="ml-auto">
                <FormattedNumber
                  value={bucket.minGoal / 100}
                  style="currency"
                  currencyDisplay="symbol"
                  currency={round.currency}
                />
              </span>
            )}

            {/* 4b) If funding ended, show "Awarded" if the awardedAmount is > 0 */}
            {fundingHasEnded && hasAwardedAmount && (
              <div className="ml-auto flex items-center text-gray-700 gap-1">
                <span className="ml-auto font-medium">
                  <FormattedMessage defaultMessage="Awarded" />
                </span>
                <span className="ml-auto">
                  <FormattedNumber
                    value={bucket.awardedAmount / 100}
                    style="currency"
                    currencyDisplay="symbol"
                    currency={round.currency}
                    minimumFractionDigits={0}
                    maximumFractionDigits={0}
                  />
                </span>
              </div>
            )}

            {/* If funding ended but awardedAmount = 0, show nothing. */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BucketCard;
