import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, gql } from "urql";
import { FormattedMessage } from "react-intl";
import Button from "components/Button";
import TextField from "components/TextField";

const CONTRIBUTE_MUTATION = gql`
  mutation Contribute($roundId: ID!, $bucketId: ID!, $amount: Int!) {
    contribute(roundId: $roundId, bucketId: $bucketId, amount: $amount) {
      id
      totalContributions
      totalContributionsFromCurrentMember
      noOfFunders
      funders {
        id
        amount
        createdAt

        roundMember {
          id
          user {
            id
            name
            username
          }
        }
      }
    }
  }
`;

const FromBalance = ({ currentUser, bucket, handleClose }) => {
  const [{ fetching: loading }, contribute] = useMutation(
    CONTRIBUTE_MUTATION
    // update(cache) {
    //   const topLevelQueryData = cache.readQuery({
    //     query: TOP_LEVEL_QUERY,
    //     variables: { slug: round.slug },
    //   });
    //   cache.writeQuery({
    //     query: TOP_LEVEL_QUERY,
    //     variables: { slug: round.slug },
    //     data: {
    //       ...topLevelQueryData,
    //       currentGroupMember: {
    //         ...topLevelQueryData.currentGroupMember,
    //         currentRoundMembership: {
    //           ...topLevelQueryData.currentGroupMember.currentRoundMembership,
    //           balance:
    //             topLevelQueryData.currentGroupMember.currentRoundMembership
    //               .balance - amount,
    //         },
    //       },
    //     },
    //   });
    // },
  );

  const [inputValue, setInputValue] = useState("");
  const [availableBalance, setAvailableBalance] = useState(
    currentUser.currentCollMember.balance / 100
  );
  const amount = Math.round(Number(inputValue) * 100);

  useEffect(() => {
    setAvailableBalance(
      currentUser.currentCollMember.balance / 100 -
        parseFloat(inputValue || "0")
    );
  }, [inputValue, currentUser.currentCollMember.balance]);

  const amountToMaxGoal =
    Math.max(bucket.minGoal, bucket.maxGoal) -
    bucket.totalContributions

  const memberBalance = currentUser.currentCollMember.balance;

  const max = bucket.round.maxAmountToBucketPerUser
    ? Math.min(
        amountToMaxGoal,
        memberBalance,
        bucket.round.maxAmountToBucketPerUser
      )
    : Math.min(amountToMaxGoal, memberBalance);

  return (
    <>
      <p className={availableBalance >= 0 ? "text-gray-800" : "text-red-600"}>
        {availableBalance >= 0 ? (
          <>
            <FormattedMessage defaultMessage="Available balance:" />{" "}
            {availableBalance} {bucket.round.currency}
          </>
        ) : (
          <FormattedMessage defaultMessage="Insufficient balance" />
        )}
      </p>
      {bucket.round.maxAmountToBucketPerUser && (
        <p className="text-sm text-gray-600 my-2">
          <FormattedMessage defaultMessage="Max." />{" "}
          {bucket.round.maxAmountToBucketPerUser / 100} {bucket.round.currency}{" "}
          to one {process.env.BUCKET_NAME_SINGULAR}
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          contribute({
            roundId: bucket.round.id,
            bucketId: bucket.id,
            amount,
          })
            .then(({ error }) => {
              if (error) {
                toast.error(error.message);
              } else {
                toast.success(
                  `You contributed ${amount / 100} ${
                    bucket.round.currency
                  } to this ${process.env.BUCKET_NAME_SINGULAR}!`
                );
              }
              handleClose();
            })
            .catch((err) => alert(err.message));
        }}
      >
        <TextField
          className="my-3"
          autoFocus
          placeholder="0"
          endAdornment={bucket.round.currency}
          size="large"
          color={bucket.round.color}
          inputProps={{
            value: inputValue,
            onChange: (e) => setInputValue(e.target.value),
            type: "number",
            min: "0.01",
            max: `${max / 100}`,
            step: 0.01,
          }}
        />
        <Button
          type="submit"
          size="large"
          fullWidth
          color={bucket.round.color}
          loading={loading}
          disabled={inputValue === "" || availableBalance < 0}
          className="my-2"
        >
          <FormattedMessage defaultMessage="Fund" />
        </Button>
        <Button
          size="large"
          fullWidth
          variant="secondary"
          color={bucket.round.color}
          onClick={handleClose}
        >
          <FormattedMessage defaultMessage="Cancel" />
        </Button>
      </form>
    </>
  );
};

export default FromBalance;
