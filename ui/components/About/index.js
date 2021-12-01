import { List, ListItem, ListItemText, Divider } from "@material-ui/core";
import dayjs from "dayjs";
import { useQuery, gql } from "urql";
import HappySpinner from "components/HappySpinner";
import Markdown from "components/Markdown";
import thousandSeparator from "utils/thousandSeparator";

export const EVENT_QUERY = gql`
  query EventQuery($orgSlug: String!, $collectionSlug: String!) {
    event(orgSlug: $orgSlug, collectionSlug: $collectionSlug) {
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
      bucketCreationCloses
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
  const [{ data: { event } = {}, fetching: loading, error }] = useQuery({
    query: EVENT_QUERY,
    variables: {
      orgSlug: router.query.org,
      collectionSlug: router.query.collection,
    },
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
                  primary={`Max. amount to one bucket per user`}
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

          {event.bucketCreationCloses && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary={`Bucket creation closes`}
                  secondary={dayjs(event.bucketCreationCloses).format(
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
              primary={`Total contributions in funding now buckets`}
              secondary={`${thousandSeparator(
                event.totalContributionsFunding / 100
              )} ${event.currency}`}
            />
          </ListItem>

          <Divider />
          <ListItem>
            <ListItemText
              primary={`Total contributions in funded buckets`}
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
