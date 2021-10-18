import { List, ListItem, ListItemText, Divider } from "@material-ui/core";
import dayjs from "dayjs";
import { useQuery, gql } from "urql";
import HappySpinner from "components/HappySpinner";

import thousandSeparator from "utils/thousandSeparator";
import dreamName from "utils/dreamName";
import Markdown from "components/Markdown";

export const EVENT_QUERY = gql`
  query EventQuery($slug: String) {
    event(slug: $slug) {
      id
      about
      guidelines {
        id
        title
        description
        position
      }
      maxAmountToBucketPerUser
      allowStretchGoals
      dreamCreationCloses
      grantingOpens
      grantingCloses
      color
      currency
      totalContributions
      totalAllocations
      totalInMembersBalances
      totalContributionsFunding
      totalContributionsFunded
    }
  }
`;

export default function AboutPage({ router, currentOrg }) {
  const [{ data: { event } = {}, fetching: loading }] = useQuery({
    query: EVENT_QUERY,
    variables: { slug: router.query.event },
  });

  if (loading)
    return (
      <div className="flex-grow flex justify-center items-center">
        <HappySpinner />
      </div>
    );

  return (
    <div className="max-w-screen-md">
      {Boolean(event.guidelines?.length) && (
        <>
          <h2 className="text-xl font-semibold mb-3" id="guidelines">
            Guidelines
          </h2>
          <div className="shadow rounded-lg bg-white relative mb-6 divide-y-default divide-gray-200">
            {event.guidelines.map((guideline) => (
              <div key={guideline.id} className="p-4">
                <h3 className="text-lg font-medium">{guideline.title}</h3>
                <Markdown source={guideline.description} />
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="text-xl font-semibold mb-3">Granting settings</h2>
      <div className="bg-white rounded-lg shadow mb-6">
        <List>
          <ListItem>
            <ListItemText primary={"Currency"} secondary={event.currency} />
          </ListItem>

          {!!event.maxAmountToBucketPerUser && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary={`Max. amount to one ${dreamName(
                    currentOrg
                  )} per user`}
                  secondary={`${thousandSeparator(
                    event.maxAmountToBucketPerUser / 100
                  )} ${event.currency}`}
                />
              </ListItem>
            </>
          )}
          <Divider />

          <ListItem>
            <ListItemText
              primary="Allow stretch goals"
              secondary={event.allowStretchGoals?.toString() ?? "false"}
            />
          </ListItem>

          {event.dreamCreationCloses && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary={`${dreamName(currentOrg, true)} creation closes`}
                  secondary={dayjs(event.dreamCreationCloses).format(
                    "MMMM D, YYYY - h:mm a"
                  )}
                />
              </ListItem>
            </>
          )}
          {event.grantingOpens && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Granting opens"
                  secondary={dayjs(event.grantingOpens).format(
                    "MMMM D, YYYY - h:mm a"
                  )}
                />
              </ListItem>
            </>
          )}
          {event.grantingCloses && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Granting closes"
                  secondary={dayjs(event.grantingCloses).format(
                    "MMMM D, YYYY - h:mm a"
                  )}
                />
              </ListItem>
            </>
          )}
        </List>
      </div>

      <h2 className="text-xl font-semibold mb-3">Granting status</h2>
      <div className="bg-white rounded-lg shadow mb-6">
        <List>
          <ListItem>
            <ListItemText
              primary="Total allocations"
              secondary={`${thousandSeparator(event.totalAllocations / 100)} ${
                event.currency
              }`}
            />
          </ListItem>
          <Divider />

          <ListItem>
            <ListItemText
              primary="Total contributions"
              secondary={`${thousandSeparator(
                event.totalContributions / 100
              )} ${event.currency}`}
            />
          </ListItem>
          <Divider />

          <ListItem>
            <ListItemText
              primary="Total in members balances (allocations - contributions)"
              secondary={`${thousandSeparator(
                event.totalInMembersBalances / 100
              )} ${event.currency}`}
            />
          </ListItem>

          <Divider />
          <ListItem>
            <ListItemText
              primary={`Total contributions in funding now ${dreamName(
                currentOrg
              )}s`}
              secondary={`${thousandSeparator(
                event.totalContributionsFunding / 100
              )} ${event.currency}`}
            />
          </ListItem>

          <Divider />
          <ListItem>
            <ListItemText
              primary={`Total contributions in funded ${dreamName(
                currentOrg
              )}s`}
              secondary={`${thousandSeparator(
                event.totalContributionsFunded / 100
              )} ${event.currency}`}
            />
          </ListItem>
        </List>
      </div>
    </div>
  );
}
