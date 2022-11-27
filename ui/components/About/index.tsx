import { List, ListItem, ListItemText, Divider } from "@material-ui/core";
import dayjs from "dayjs";
import { sortBy } from "lodash";
import Markdown from "components/Markdown";
import BillBreakdown from "components/BillBreakdown";
import capitalize from "utils/capitalize";
import { FormattedMessage, useIntl } from "react-intl";
import FormattedCurrency from "components/FormattedCurrency";

export default function AboutPage({ router, round }) {
  const intl = useIntl();

  // if (error) return <div>{error.message}</div>;

  // if (loading)
  //   return (
  //     <div className="flex-grow flex justify-center items-center">
  //       <HappySpinner />
  //     </div>
  //   );

  // const round = data?.round;
  if (!round)
    return (
      <div>
        <FormattedMessage defaultMessage="Loading..." />
      </div>
    );
  return (
    <div className="max-w-screen-md">
      {Boolean(round?.guidelines?.length) && (
        <>
          <h2 className="text-xl font-semibold mb-3" id="guidelines">
            <FormattedMessage defaultMessage="Guidelines" />
          </h2>
          <div className="shadow rounded-lg bg-white relative mb-6 divide-y-default divide-gray-200">
            {sortBy(round.guidelines, (g) => g.position).map((guideline) => (
              <div key={guideline.id} className="p-4">
                <h3 className="text-lg font-medium">{guideline.title}</h3>
                <Markdown source={guideline.description} />
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="text-xl font-semibold mb-3">
        <FormattedMessage defaultMessage="Funding settings" />
      </h2>
      <div className="bg-white rounded-lg shadow mb-6">
        <List>
          <ListItem>
            <ListItemText
              primary={intl.formatMessage({ defaultMessage: "Currency" })}
              secondary={round.currency}
            />
          </ListItem>

          {!!round.maxAmountToBucketPerUser && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary={
                    //`Max. amount to one ${process.env.BUCKET_NAME_SINGULAR} per user`
                    intl.formatMessage(
                      {
                        defaultMessage:
                          "Max. amount to one {bucketName} per user",
                      },
                      { bucketName: process.env.BUCKET_NAME_SINGULAR }
                    )
                  }
                  secondary={intl.formatNumber(
                    round.maxAmountToBucketPerUser / 100,
                    {
                      style: "currency",
                      currency: round.currency,
                    }
                  )}
                />
              </ListItem>
            </>
          )}
          <Divider />

          <ListItem>
            <ListItemText
              primary="Allow stretch goals"
              secondary={round.allowStretchGoals?.toString() ?? "false"}
            />
          </ListItem>

          {round.bucketCreationCloses && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary={intl.formatMessage(
                    { defaultMessage: "{bucketName} creation closes" },
                    { bucketName: capitalize(process.env.BUCKET_NAME_SINGULAR) }
                  )}
                  secondary={dayjs(round.bucketCreationCloses).format(
                    "MMMM D, YYYY - h:mm a"
                  )}
                />
              </ListItem>
            </>
          )}
          {round.grantingOpens && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary={intl.formatMessage({
                    defaultMessage: "Funding opens",
                  })}
                  secondary={dayjs(round.grantingOpens).format(
                    "MMMM D, YYYY - h:mm a"
                  )}
                />
              </ListItem>
            </>
          )}
          {round.grantingCloses && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary={intl.formatMessage({
                    defaultMessage: "Funding closes",
                  })}
                  secondary={dayjs(round.grantingCloses).format(
                    "MMMM D, YYYY - h:mm a"
                  )}
                />
              </ListItem>
            </>
          )}
        </List>
      </div>

      <h2 className="text-xl font-semibold mb-3">
        <FormattedMessage defaultMessage="Funding status" />
      </h2>
      <div className="bg-white rounded-lg shadow mb-6">
        <BillBreakdown
          parts={[
            {
              title: intl.formatMessage({ defaultMessage: "Allocated funds" }),
              total: (
                <FormattedCurrency
                  value={round.totalContributions}
                  currency={round.currency}
                />
              ),
              breakdown: [
                {
                  title: intl.formatMessage(
                    {
                      defaultMessage: `Contributions made to {bucketName} open for funding`,
                    },
                    {
                      bucketName: process.env.BUCKET_NAME_SINGULAR,
                    }
                  ),
                  amount: (
                    <FormattedCurrency
                      value={round.totalContributionsFunding}
                      currency={round.currency}
                    />
                  ),
                },
                {
                  title: intl.formatMessage(
                    {
                      defaultMessage: `Contributions made to funded {bucketName}`,
                    },
                    {
                      bucketName: process.env.BUCKET_NAME_PLURAL,
                    }
                  ),
                  amount: (
                    <FormattedCurrency
                      value={round.totalContributionsFunded}
                      currency={round.currency}
                    />
                  ),
                },
              ],
            },
            {
              title: intl.formatMessage({
                defaultMessage: "Unallocated funds",
              }),
              total: (
                <FormattedCurrency
                  value={round.totalInMembersBalances}
                  currency={round.currency}
                />
              ),
              breakdown: [],
            },
          ]}
          totalTitle={intl.formatMessage({
            defaultMessage: "Total funds available",
          })}
          totalAmount={
            <FormattedCurrency
              value={round.totalAllocations}
              currency={round.currency}
            />
          }
        />
      </div>
    </div>
  );
}
