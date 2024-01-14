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

function RoundSuperAdmin({ round, currentGroup }) {
  const [{ fetching }, changeRoundSize] = useMutation(CHANGE_ROUND_SIZE);

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
    </div>
  );
}

export default RoundSuperAdmin;
