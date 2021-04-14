import thousandSeparator from "utils/thousandSeparator";
import ProgressBar from "components/ProgressBar";

const GrantingStatus = ({ dream, event }) => {
  return (
    <>
      {dream.minGoal > 0 && (
        <ProgressBar
          ratio={dream.totalContributions / dream.minGoal}
          className="mb-2"
          size="large"
          color={event.color}
        />
      )}
      <div className="mb-3">
        <p className={`text-xl font-semibold text-${event.color}-dark`}>
          {thousandSeparator(dream.totalContributions / 100)} {event.currency}
        </p>
        <p className="text-sm text-gray-700">
          contributed of {thousandSeparator(dream.minGoal / 100)}{" "}
          {event.currency} goal
        </p>
      </div>
    </>
  );
};

export default GrantingStatus;
