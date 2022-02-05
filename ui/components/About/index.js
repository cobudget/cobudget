import { List, ListItem, ListItemText, Divider } from "@material-ui/core";
import dayjs from "dayjs";
import { useQuery, gql } from "urql";
import HappySpinner from "components/HappySpinner";
import Markdown from "components/Markdown";
import thousandSeparator from "utils/thousandSeparator";
import BillBreakdown from "components/BillBreakdown";

export const COLLECTION_QUERY = gql`
  query CollectionQuery($orgSlug: String!, $collectionSlug: String!) {
    collection(orgSlug: $orgSlug, collectionSlug: $collectionSlug) {
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
  const [{ data: { collection } = {}, fetching: loading, error }] = useQuery({
    query: COLLECTION_QUERY,
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
      {Boolean(collection.guidelines?.length) && (
        <>
          <h2 className="text-xl font-semibold mb-3" id="guidelines">
            Guidelines
          </h2>
          <div className="shadow rounded-lg bg-white relative mb-6 divide-y-default divide-gray-200">
            {collection.guidelines.map((guideline) => (
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
            <ListItemText
              primary={"Currency"}
              secondary={collection.currency}
            />
          </ListItem>

          {!!collection.maxAmountToBucketPerUser && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary={`Max. amount to one bucket per user`}
                  secondary={`${thousandSeparator(
                    collection.maxAmountToBucketPerUser / 100
                  )} ${collection.currency}`}
                />
              </ListItem>
            </>
          )}
          <Divider />

          <ListItem>
            <ListItemText
              primary="Allow stretch goals"
              secondary={collection.allowStretchGoals?.toString() ?? "false"}
            />
          </ListItem>

          {collection.bucketCreationCloses && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary={`Bucket creation closes`}
                  secondary={dayjs(collection.bucketCreationCloses).format(
                    "MMMM D, YYYY - h:mm a"
                  )}
                />
              </ListItem>
            </>
          )}
          {collection.grantingOpens && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Granting opens"
                  secondary={dayjs(collection.grantingOpens).format(
                    "MMMM D, YYYY - h:mm a"
                  )}
                />
              </ListItem>
            </>
          )}
          {collection.grantingCloses && (
            <>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Granting closes"
                  secondary={dayjs(collection.grantingCloses).format(
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
              total: `${thousandSeparator(
                collection.totalContributions / 100
              )} ${collection.currency}`,
              breakdown: [
                {
                  title: "Contributions made to bucket open for funding", 
                  amount: `${thousandSeparator(
                    collection.totalContributionsFunding / 100
                  )} ${collection.currency}`
                },
                {
                  title: "Contributions made to funded buckets", 
                  amount: `${thousandSeparator(
                  collection.totalContributionsFunded / 100
                )} ${collection.currency}`}
              ]
            },
            {
              title: "Unallocated Funds",
              total: `${thousandSeparator(
                collection.totalInMembersBalances / 100
              )} ${collection.currency}`,
              breakdown: []
            }
          ]}
          totalTitle={"Total Funds Available"}
          totalAmount={`${thousandSeparator(
            collection.totalAllocations / 100
          )} ${collection.currency}`}
        />
      </div>
    </div>
  );
}
