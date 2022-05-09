import dayjs from "dayjs";

import thousandSeparator from "utils/thousandSeparator";
import ProgressBar from "components/ProgressBar";

const GrantingStatus = ({ bucket, round }) => {
  const funding = bucket.totalContributions + bucket.income;
  const ratio = isNaN(funding / bucket.minGoal) ? 0 : funding / bucket.minGoal;
  //const userName = (nameOrEmail) =>
  //  (nameOrEmail ?? "Somebody").match(/@/) === null ? nameOrEmail : "Somebody";

  return (
    <div className="space-y-0">
      <div className="mb-2">
        <ProgressBar
          ratio={ratio}
          className="mb-2"
          size="large"
          color={round.color}
        />
        <p className={`text-xl font-semibold text-${round.color}-dark`}>
          {thousandSeparator(funding / 100)} {round.currency}
        </p>
        <p className="text-sm text-gray-700 mb-2">
          funded of {thousandSeparator(bucket.minGoal / 100)} {round.currency}{" "}
          goal
        </p>

        {!!bucket.totalContributionsFromCurrentMember && (
          <p className="my-2 text-sm text-gray-700">
            You have contributed{" "}
            {thousandSeparator(
              bucket.totalContributionsFromCurrentMember / 100
            )}{" "}
            {round.currency}
          </p>
        )}
      </div>

      <div className="text-sm text-gray-700 space-y-2">
        {bucket.funded && (
          <p>Funded on {dayjs(bucket.fundedAt).format("MMMM D, YYYY")}</p>
        )}
        {bucket.canceled && (
          <p>
            Funding canceled on{" "}
            {dayjs(bucket.canceledAt).format("MMMM D, YYYY")}
          </p>
        )}
        {bucket.completed && (
          <p>Completed on {dayjs(bucket.completedAt).format("MMMM D, YYYY")}</p>
        )}
      </div>
    </div>
  );
};

export default GrantingStatus;
