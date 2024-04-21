import Button from "components/Button";
import React from "react";
import toast from "react-hot-toast";
import { FormattedMessage } from "react-intl";
import { gql, useMutation } from "urql";

const CHANGE_ROUND_SIZE = gql`
  mutation Mutation($roundId: ID!, $maxMembers: Int) {
    changeRoundSize(roundId: $roundId, maxMembers: $maxMembers) {
      id
      membersLimit {
        limit
        currentCount
      }
    }
  }
`;

const CHANGE_BUCKET_LIMIT = gql`
  mutation Mutation($roundId: ID!, $maxFreeBuckets: Int) {
    changeBucketLimit(roundId: $roundId, maxFreeBuckets: $maxFreeBuckets) {
      id
      bucketsLimit {
        limit
        currentCount
        isLimitOver
      }
    }
  }
`;

function RoundSuperAdmin({ round, currentGroup }) {
  const [{ fetching }, changeRoundSize] = useMutation(CHANGE_ROUND_SIZE);
  const [{ fetching: bucketLimitUpdating }, changeBucketLimit] = useMutation(
    CHANGE_BUCKET_LIMIT
  );

  const handleChange = async () => {
    const count = parseInt(window.prompt("Enter members count"));
    if (isNaN(count) || count <= 0) {
      return toast.error("Enter a valid number");
    }
    const response = await changeRoundSize({
      roundId: round?.id,
      maxMembers: count,
    });

    if (response.error) {
      toast.error("Error occurred");
    }
  };

  const handleChangeBucketSize = async () => {
    const count = parseInt(window.prompt("Enter max bucket count"));
    if (isNaN(count) || count <= 0) {
      return toast.error("Enter a valid number");
    }
    const response = await changeBucketLimit({
      roundId: round?.id,
      maxFreeBuckets: count,
    });

    if (response.error) {
      toast.error("Error occurred");
    } else {
      toast.success("Updated");
    }
  };

  return (
    <div>
      <div className="py-2">
        <h2 className="text-2xl font-semibold px-6">
          <FormattedMessage defaultMessage="Super Admin" />
        </h2>
      </div>
      <div className="my-6 px-6 border-b border-b-default pb-2 flex justify-between">
        <div>
          <p className="font-bold">
            <FormattedMessage defaultMessage={"Change group size"} />
          </p>
          <p>
            <FormattedMessage defaultMessage={"Current size is "} />{" "}
            {round?.membersLimit?.limit}
          </p>
        </div>
        <div>
          <Button loading={fetching} onClick={handleChange}>
            Change
          </Button>
        </div>
      </div>
      {!currentGroup && (
        <div className="my-6 px-6 border-b border-b-default pb-2 flex justify-between">
          <div>
            <p className="font-bold">
              <FormattedMessage defaultMessage={"Change funded bucket limit"} />
            </p>
            <p>
              <FormattedMessage defaultMessage={"Current size is "} />{" "}
              {round?.bucketsLimit?.limit}
            </p>
          </div>
          <div>
            <Button
              loading={bucketLimitUpdating}
              onClick={handleChangeBucketSize}
            >
              Change
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoundSuperAdmin;
