import { useQuery, useMutation, gql } from "urql";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { Tooltip } from "react-tippy";
import HappySpinner from "components/HappySpinner";
import IconButton from "components/IconButton";
import { EditIcon } from "components/Icons";
import { useState } from "react";

const BUCKET_QUERY = gql`
  query Bucket($id: ID!) {
    bucket(id: $id) {
      id
      directFundingEnabled
    }
  }
`;

const EDIT_BUCKET_MUTATION = gql`
  mutation EditBucket($bucketId: ID!, $directFundingEnabled: Boolean) {
    editBucket(
      bucketId: $bucketId
      directFundingEnabled: $directFundingEnabled
    ) {
      id
      directFundingEnabled
    }
  }
`;

const DirectFunding = ({ canEdit = false, round }) => {
  const router = useRouter();
  const bucketId = router.query.bucket;

  const [editing, setEditing] = useState(false);

  const [{ data, fetching: fetchingQuery, error }] = useQuery({
    query: BUCKET_QUERY,
    variables: { id: bucketId },
  });

  const [{ fetching: fetchingMutation }, editBucket] = useMutation(
    EDIT_BUCKET_MUTATION
  );

  // we don't show this section at all to people who aren't admins/cocreators. they'll interact through the Fund button instead
  if (!canEdit || !round.directFundingEnabled) return null;

  if (fetchingQuery) return <HappySpinner />;

  if (error) {
    console.error(error);
    return <div>{error.message}</div>;
  }

  const bucket = data.bucket;

  return bucket.directFundingEnabled ? (
    <div>
      <h2 className="text-xl font-medium mb-2">Direct funding</h2>
      <div className="flex justify-between">
        <div>
          <div className="font-medium">Terms</div>
          {editing ? (
            <div>Now we are editing thiiiiings</div>
          ) : (
            <div>Funds received are donations{/*TODO: make dynamic*/}</div>
          )}
        </div>
        {!editing && (
          <Tooltip title="Edit Direct funding" position="bottom" size="small">
            <IconButton onClick={() => setEditing(true)}>
              <EditIcon className="h-6 w-6" />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  ) : (
    <button
      disabled={fetchingMutation}
      onClick={() =>
        editBucket({ bucketId, directFundingEnabled: true }).then(
          ({ error }) => {
            if (error) {
              console.error(error);
              toast.error(error.message);
            }
          }
        )
      }
      className="block w-full h-32 text-gray-600 font-semibold rounded-lg border-3 border-dashed focus:outline-none focus:bg-gray-100 hover:bg-gray-100 mb-4"
    >
      + Direct funding
    </button>
  );
};

export default DirectFunding;
