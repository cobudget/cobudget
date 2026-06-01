import { useState } from "react";
import { Modal } from "@material-ui/core";
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
      status
      funded
      isFavorite
      fundedAt
    }
  }
`;

const WithdrawModal = ({ handleClose, bucket, currentUser }) => {
  const [{ fetching: loading }, contribute] = useMutation(CONTRIBUTE_MUTATION);
  const [inputValue, setInputValue] = useState("");

  const contributed = bucket.totalContributionsFromCurrentMember / 100;
  const amount = Math.round(Number(inputValue) * 100);

  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-sm m-auto">
        <h1 className="text-2xl mb-2 font-semibold">
          <FormattedMessage defaultMessage="Withdraw from" /> {bucket.title}
        </h1>

        <p className="text-gray-600 mb-4">
          <FormattedMessage defaultMessage="You have contributed" />{" "}
          <strong>
            {contributed} {bucket.round.currency}
          </strong>{" "}
          <FormattedMessage defaultMessage="to this bucket. Enter the amount you want to withdraw." />
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            contribute({
              roundId: bucket.round.id,
              bucketId: bucket.id,
              amount: -amount,
            })
              .then(({ error }) => {
                if (error) {
                  toast.error(error.message);
                } else {
                  toast.success(
                    `You withdrew ${amount / 100} ${bucket.round.currency} from this ${process.env.BUCKET_NAME_SINGULAR}.`
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
              max: `${contributed}`,
              step: 0.01,
            }}
          />
          <Button
            type="submit"
            size="large"
            fullWidth
            color={bucket.round.color}
            loading={loading}
            disabled={inputValue === "" || amount <= 0 || amount > contributed * 100}
            className="my-2"
          >
            <FormattedMessage defaultMessage="Withdraw" />
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
      </div>
    </Modal>
  );
};

export default WithdrawModal;
