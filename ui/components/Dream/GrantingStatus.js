import thousandSeparator from "utils/thousandSeparator";
import ProgressBar from "components/ProgressBar";

const GrantingStatus = ({ dream }) => {
  return (
    <>
      <div
        className={`grid gap-1 text-center ${
          dream.maxGoalGrants ? "grid-cols-3" : "grid-cols-2"
        }`}
      >
        <div>
          <span className="block text-xl font-medium">
            {thousandSeparator(dream.currentNumberOfGrants)}
          </span>
          <span className="uppercase text-sm">Funded</span>
        </div>
        <div>
          <span className="block text-xl font-medium">
            {dream.minGoalGrants ? thousandSeparator(dream.minGoalGrants) : "-"}
          </span>

          <span className="uppercase text-sm">Goal</span>
        </div>
        {dream.maxGoalGrants && (
          <div>
            <span className="block text-xl font-medium">
              {thousandSeparator(dream.maxGoalGrants)}
            </span>

            <span className="uppercase text-sm">Max. goal</span>
          </div>
        )}
      </div>

      <div className="my-4">
        {dream.minGoalGrants > 0 && (
          <ProgressBar
            currentNumberOfGrants={dream.currentNumberOfGrants}
            minGoalGrants={dream.minGoalGrants}
            maxGoalGrants={dream.maxGoalGrants}
            height={10}
          />
        )}
      </div>
    </>
  );
};

export default GrantingStatus;
