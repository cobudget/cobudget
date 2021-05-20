import dayjs from "dayjs";

import thousandSeparator from "utils/thousandSeparator";
import ProgressBar from "components/ProgressBar";

const GrantingStatus = ({ dream, event }) => {
  const funding = dream.totalContributions + dream.income;
  const ratio = isNaN(funding / dream.minGoal)
    ? 0
    : funding / dream.minGoal;

  return (
    <div className="space-y-0">
      {dream.approved && (
        <div className="mb-2">
          <ProgressBar
            ratio={ratio}
            className="mb-2"
            size="large"
            color={event.color}
          />
          <p className={`text-xl font-semibold text-${event.color}-dark`}>
            {thousandSeparator(funding / 100)} {event.currency}
          </p>
          <p className="text-sm text-gray-700">
            funded of {thousandSeparator(dream.minGoal / 100)}{" "}
            {event.currency} goal
          </p>
        </div>
      )}

      <div className="text-sm text-gray-700 space-y-2">
        {dream.funded && (
          <p>Funded on {dayjs(dream.fundedAt).format("MMMM D, YYYY")}</p>
        )}
        {dream.canceled && (
          <p>
            Funding canceled on {dayjs(dream.canceledAt).format("MMMM D, YYYY")}
          </p>
        )}
        {dream.completed && (
          <p>Completed on {dayjs(dream.completedAt).format("MMMM D, YYYY")}</p>
        )}
      </div>
    </div>
  );
};

export default GrantingStatus;
