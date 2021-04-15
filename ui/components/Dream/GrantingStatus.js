import dayjs from "dayjs";

import thousandSeparator from "utils/thousandSeparator";
import ProgressBar from "components/ProgressBar";

const GrantingStatus = ({ dream, event }) => {
  return (
    <div className="space-y-0">
      {dream.minGoal > 0 && (
        <ProgressBar
          ratio={dream.totalContributions / dream.minGoal}
          className="mb-2"
          size="large"
          color={event.color}
        />
      )}
      <p className={`text-xl font-semibold text-${event.color}-dark`}>
        {thousandSeparator(dream.totalContributions / 100)} {event.currency}
      </p>
      <div className="text-sm text-gray-700 space-y-2">
        <p>
          contributed of {thousandSeparator(dream.minGoal / 100)}{" "}
          {event.currency} goal
        </p>
        {dream.funded && (
          <p>Funded on {dayjs(dream.fundedAt).format("MMMM D, YYYY")}</p>
        )}
        {dream.completed && (
          <p>Completed on {dayjs(dream.completedAt).format("MMMM D, YYYY")}</p>
        )}
      </div>
    </div>
  );
};

export default GrantingStatus;
