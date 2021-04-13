import thousandSeparator from "utils/thousandSeparator";
import ProgressBar from "components/ProgressBar";

const GrantingStatus = ({ dream, event }) => {
  return (
    <>
      <div
        className={`grid gap-1 text-center ${
          dream.maxGoal ? "grid-cols-3" : "grid-cols-2"
        }`}
      >
        <div>
          <span className="block text-xl font-medium">
            {thousandSeparator(dream.totalContributions / 100)} {event.currency}
          </span>
          <span className="uppercase text-sm">Funded</span>
        </div>
        <div>
          <span className="block text-xl font-medium">
            {dream.minGoal ? thousandSeparator(dream.minGoal / 100) : "-"}{" "}
            {event.currency}
          </span>

          <span className="uppercase text-sm">Goal</span>
        </div>
        {dream.maxGoal && (
          <div>
            <span className="block text-xl font-medium">
              {thousandSeparator(dream.maxGoal / 100)} {event.currency}
            </span>

            <span className="uppercase text-sm">Max. goal</span>
          </div>
        )}
      </div>

      <div className="my-4">
        {dream.minGoal > 0 && (
          <ProgressBar
            totalContributions={dream.totalContributions}
            minGoal={dream.minGoal}
            maxGoal={dream.maxGoal}
            height={10}
          />
        )}
      </div>
    </>
  );
};

export default GrantingStatus;
