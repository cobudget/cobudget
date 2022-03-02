import { useState, useEffect } from "react";
import { useMutation, gql } from "urql";
import { Modal } from "@material-ui/core";
import Button from "components/Button";
import TextField from "components/TextField";
import toast from "react-hot-toast";

const CONTRIBUTE_MUTATION = gql`
  mutation Contribute($collectionId: ID!, $bucketId: ID!, $amount: Int!) {
    contribute(
      collectionId: $collectionId
      bucketId: $bucketId
      amount: $amount
    ) {
      id
      totalContributions
      totalContributionsFromCurrentMember
      noOfFunders
      funders {
        id
        amount
        createdAt

        collectionMember {
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

const ContributeModal = ({ handleClose, bucket, collection, currentUser }) => {
  const [inputValue, setInputValue] = useState("");
  const [availableBalance, setAvailableBalance] = useState(currentUser.currentCollMember.balance / 100);
  const amount = Math.round(inputValue * 100);

  useEffect(() => {
    setAvailableBalance(
      (currentUser.currentCollMember.balance / 100) - parseFloat(inputValue || '0')
    );
  }, [inputValue, currentUser.currentCollMember.balance]);

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
    //       currentOrgMember: {
    //         ...topLevelQueryData.currentOrgMember,
    //         currentRoundMembership: {
    //           ...topLevelQueryData.currentOrgMember.currentRoundMembership,
    //           balance:
    //             topLevelQueryData.currentOrgMember.currentRoundMembership
    //               .balance - amount,
    //         },
    //       },
    //     },
    //   });
    // },
  );

  const amountToMaxGoal =
    Math.max(bucket.minGoal, bucket.maxGoal) - bucket.totalContributions;

  const memberBalance = currentUser.currentCollMember.balance;

  const max = collection.maxAmountToBucketPerUser
    ? Math.min(
        amountToMaxGoal,
        memberBalance,
        collection.maxAmountToBucketPerUser
      )
    : Math.min(amountToMaxGoal, memberBalance);

  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-sm">
        <h1 className="text-2xl mb-2 font-semibold">
          Contribute to {bucket.title}
        </h1>
        <p className={ availableBalance >= 0 ? "text-gray-800" : "text-red-600" }>
          {
            availableBalance >= 0 ?
            `Available balance: ${availableBalance} ${collection.currency}`
            : "Insufficient balance"
          }
        </p>
        {collection.maxAmountToBucketPerUser && (
          <p className="text-sm text-gray-600 my-2">
            Max. {collection.maxAmountToBucketPerUser / 100}{" "}
            {collection.currency} to one bucket
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            contribute({
              collectionId: collection.id,
              bucketId: bucket.id,
              amount,
            })
              .then(({ data, error }) => {
                if (error) {
                  toast.error(error.message);
                } else {
                  toast.success(
                    `You contributed ${amount / 100} ${
                      collection.currency
                    } to this bucket!`
                  );
                }
                handleClose();
              })
              .catch((err) => alert(err.message));
          }}
        >
          <TextField
            fullWidth
            className="my-3"
            autoFocus
            placeholder="0"
            endAdornment={collection.currency}
            size="large"
            color={collection.color}
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
            color={collection.color}
            loading={loading}
            disabled={inputValue === "" || availableBalance < 0}
            className="my-2"
          >
            Fund
          </Button>
          <Button
            size="large"
            fullWidth
            variant="secondary"
            color={collection.color}
            onClick={handleClose}
          >
            Cancel
          </Button>
        </form>
      </div>
    </Modal>
  );
};

export default ContributeModal;
