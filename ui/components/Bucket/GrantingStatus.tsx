import dayjs from "dayjs";
import { FormattedMessage, FormattedNumber } from "react-intl";
import ProgressBar from "components/ProgressBar";

const GrantingStatus = ({ bucket }) => {
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
          color={bucket.round.color}
        />
        <p className={`text-xl font-semibold text-${bucket.round.color}-dark`}>
          <FormattedNumber
            value={funding / 100}
            style="currency"
            currencyDisplay={"symbol"}
            currency={bucket.round.currency}
          />
        </p>
        <p className="text-sm text-gray-700 mb-2">
          <FormattedMessage
            defaultMessage="funded of {total} goal"
            values={{
              total: (
                <FormattedNumber
                  style="currency"
                  currencyDisplay={"symbol"}
                  currency={bucket.round.currency}
                  value={bucket.minGoal / 100}
                />
              ),
            }}
          />
        </p>

        {!!bucket.totalContributionsFromCurrentMember && (
          <p className="my-2 text-sm text-gray-700">
            <FormattedMessage
              defaultMessage="You have contributed {total}"
              values={{
                total: (
                  <FormattedNumber
                    style="currency"
                    currencyDisplay={"symbol"}
                    currency={bucket.round.currency}
                    value={bucket.totalContributionsFromCurrentMember / 100}
                  />
                ),
              }}
            />
          </p>
        )}
      </div>

      <div className="text-sm text-gray-700 space-y-2">
        {bucket.funded && (
          <p>
          <FormattedMessage
            defaultMessage="Funded on {day}"
            values={{
              day: dayjs(bucket.fundedAt).format("MMMM D, YYYY"),
            }}
          />
          </p>
        )}
        {bucket.canceled && (
          <p>
            <FormattedMessage
              defaultMessage="Funding canceled on {day}"
              values={{
                day: dayjs(bucket.canceledAt).format("MMMM D, YYYY"),
              }}
            />
          </p>
        )}
        {bucket.completed && (
          <FormattedMessage
            defaultMessage="Completed on {day}"
            values={{
              day: dayjs(bucket.completedAt).format("MMMM D, YYYY"),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default GrantingStatus;
