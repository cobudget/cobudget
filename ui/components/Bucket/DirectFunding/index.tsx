import { useState } from "react";
import { useQuery, useMutation, gql } from "urql";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Tooltip from "@tippyjs/react";
import { FormattedMessage, useIntl } from "react-intl";
import HappySpinner from "components/HappySpinner";
import IconButton from "components/IconButton";
import { EditIcon } from "components/Icons";
import Form from "./Form";
import { COCREATORS_CANT_EDIT } from "utils/messages";

const BUCKET_QUERY = gql`
  query Bucket($id: ID!) {
    bucket(id: $id) {
      id
      directFundingEnabled
      directFundingType
      exchangeDescription
      exchangeMinimumContribution
      exchangeVat
    }
  }
`;

const EDIT_BUCKET_MUTATION = gql`
  mutation EditBucket(
    $bucketId: ID!
    $directFundingEnabled: Boolean
    $directFundingType: DirectFundingType
    $exchangeDescription: String
    $exchangeMinimumContribution: Int
    $exchangeVat: Int
  ) {
    editBucket(
      bucketId: $bucketId
      directFundingEnabled: $directFundingEnabled
      directFundingType: $directFundingType
      exchangeDescription: $exchangeDescription
      exchangeMinimumContribution: $exchangeMinimumContribution
      exchangeVat: $exchangeVat
    ) {
      id
      directFundingEnabled
      directFundingType
      exchangeDescription
      exchangeMinimumContribution
      exchangeVat
    }
  }
`;

const DirectFunding = ({ canEdit = false, round, isEditingAllowed }) => {
  const intl = useIntl();
  const router = useRouter();
  const bucketId = router.query.bucket;

  const [editing, setEditing] = useState(false);

  const handleEdit = () => {
    if (isEditingAllowed) {
      setEditing(true);
    } else {
      toast.error(COCREATORS_CANT_EDIT);
    }
  };

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
      <h2 className="text-xl font-medium mb-2">
        <FormattedMessage defaultMessage="Direct funding" />
      </h2>
      <div className="flex justify-between">
        <div>
          <div className="font-medium">
            <FormattedMessage defaultMessage="Terms" />
          </div>
          {editing ? (
            <Form
              bucket={bucket}
              editBucket={editBucket}
              fetchingMutation={fetchingMutation}
              round={round}
              exitEditing={() => setEditing(false)}
            />
          ) : (
            <div>
              {bucket.directFundingType === "DONATION" ? (
                <FormattedMessage defaultMessage="Funds received are donations" />
              ) : (
                <FormattedMessage defaultMessage="We are offering goods or services in exchange for funds." />
              )}
            </div>
          )}
        </div>
        {!editing && (
          <Tooltip
            content={intl.formatMessage({
              defaultMessage: "Edit Direct funding",
            })}
            placement="bottom"
            arrow={false}
          >
            <IconButton onClick={handleEdit}>
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
      <FormattedMessage defaultMessage="+ Direct funding" />
    </button>
  );
};

export default DirectFunding;
