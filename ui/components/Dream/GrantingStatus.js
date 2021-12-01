import dayjs from "dayjs";

import thousandSeparator from "utils/thousandSeparator";
import ProgressBar from "components/ProgressBar";

const GrantingStatus = ({ dream, event }) => {
  const funding = dream.totalContributions + dream.income;
  const ratio = isNaN(funding / dream.minGoal) ? 0 : funding / dream.minGoal;
  const userName = (nameOrEmail) =>
    (nameOrEmail ?? "Somebody").match(/@/) === null ? nameOrEmail : "Somebody";

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
          <p className="text-sm text-gray-700 mb-2">
            funded of {thousandSeparator(dream.minGoal / 100)} {event.currency}{" "}
            goal
          </p>

          {!!dream.totalContributionsFromCurrentMember && (
            <p className="my-2 text-sm text-gray-700">
              You have contributed{" "}
              {thousandSeparator(
                dream.totalContributionsFromCurrentMember / 100
              )}{" "}
              {event.currency}
            </p>
          )}

          {!!dream.latestContributions.length && (
            <>
              <div>
                {dream.latestContributions.map((contribution) => (
                  <p
                    className="mt-1 text-sm text-gray-700"
                    key={contribution.id}
                  >
                    {userName(contribution.eventMember.orgMember.user.username)}{" "}
                    contributed {thousandSeparator(contribution.amount / 100)}{" "}
                    {event.currency}
                  </p>
                ))}
              </div>
              {dream.noOfContributions > 10 && (
                <p className="my-1 text-sm text-gray-700">
                  and {dream.noOfContributions - 10} more contributions
                </p>
              )}
            </>
          )}
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
