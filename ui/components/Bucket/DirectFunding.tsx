import { useQuery, useMutation, gql } from "urql";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import HappySpinner from "components/HappySpinner";

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

  const [{ data, fetching: fetchingQuery, error }] = useQuery({
    query: BUCKET_QUERY,
    variables: { id: bucketId },
  });

  const [{ fetching: fetchingMutation }, editBucket] = useMutation(
    EDIT_BUCKET_MUTATION
  );

  if (!canEdit || !round.directFundingEnabled) return null;

  if (fetchingQuery) return <HappySpinner />;

  if (error) {
    console.error(error);
    return <div>{error.message}</div>;
  }

  const bucket = data.bucket;

  return bucket.directFundingEnabled ? (
    <div>Direct funding is enabled for this bucket</div>
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
