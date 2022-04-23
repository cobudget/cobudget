import { List, ListItem, ListItemText, Divider } from "@material-ui/core";
import dayjs from "dayjs";
import { sortBy } from "lodash";
import Markdown from "components/Markdown";
import thousandSeparator from "utils/thousandSeparator";
import BillBreakdown from "components/BillBreakdown";
import capitalize from "utils/capitalize";
import {FormattedMessage} from 'react-intl';

export default function AboutPage({ router, round }) {
  // if (error) return <div>{error.message}</div>;

  // if (loading)
  //   return (
  //     <div className="flex-grow flex justify-center items-center">
  //       <HappySpinner />
  //     </div>
  //   );

  // const round = data?.round;
  if (!round) return <div>Loading...</div>;
  return (
    <div className="max-w-screen-md">
      {Boolean(round?.guidelines?.length) && (
        <>
          <h2 className="text-xl font-semibold mb-3" id="guidelines">
            Guidelines
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

      <h2 className="text-xl font-semibold mb-3">Funding settings</h2>
      <div className="bg-white rounded-lg shadow mb-6">
        <List>
          <ListItem>
            <ListItemText primary={"Currency"} secondary={round.currency} />
          </ListItem>

          {!!round.maxAmountToBucketPerUser && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary={`Max. amount to one ${process.env.BUCKET_NAME_SINGULAR} per user`}
                  secondary={`${thousandSeparator(
                    round.maxAmountToBucketPerUser / 100
                  )} ${round.currency}`}
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
                  primary={`${capitalize(
                    process.env.BUCKET_NAME_SINGULAR
                  )} creation closes`}
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
                  primary="Funding opens"
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
                  primary="Funding closes"
                  secondary={dayjs(round.grantingCloses).format(
                    "MMMM D, YYYY - h:mm a"
                  )}
                />
              </ListItem>
            </>
          )}
        </List>
      </div>

      <h2 className="text-xl font-semibold mb-3">Funding status</h2>
      <div className="bg-white rounded-lg shadow mb-6">
        <BillBreakdown
          parts={[
            {
              title: "Allocated funds",
              total: `${thousandSeparator(round.totalContributions / 100)} ${
                round.currency
              }`,
              breakdown: [
                {
                  title: `Contributions made to ${process.env.BUCKET_NAME_SINGULAR} open for funding`,
                  amount: `${thousandSeparator(
                    round.totalContributionsFunding / 100
                  )} ${round.currency}`,
                },
                {
                  title: `Contributions made to funded ${process.env.BUCKET_NAME_PLURAL}`,
                  amount: `${thousandSeparator(
                    round.totalContributionsFunded / 100
                  )} ${round.currency}`,
                },
              ],
            },
            {
              title: "Unallocated funds",
              total: `${thousandSeparator(
                round.totalInMembersBalances / 100
              )} ${round.currency}`,
              breakdown: [],
            },
          ]}
          totalTitle={"Total funds available"}
          totalAmount={`${thousandSeparator(round.totalAllocations / 100)} ${
            round.currency
          }`}
        />
      </div>
    </div>
  );
}
