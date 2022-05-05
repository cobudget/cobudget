import { useState } from "react";
import toast from "react-hot-toast";
import Markdown from "components/Markdown";
import Button from "components/Button";
import SelectInput from "components/SelectInput";
import Wysiwyg from "components/Wysiwyg";
import TextField from "components/TextField";

const DirectFundingBucketForm = ({
  bucket,
  editBucket,
  fetchingMutation,
  round,
  exitEditing,
}) => {
  const [directFundingType, setDirectFundingType] = useState<string>(
    bucket.directFundingType
  );
  const [exchangeDescription, setExchangeDescription] = useState<string>(
    bucket.exchangeDescription
  );

  const [
    exchangeMinimumContribution,
    setExchangeMinimumContribution,
  ] = useState<number>(bucket.exchangeMinimumContribution);

  return (
    <>
      {round.directFundingTerms && (
        <Markdown
          source={round.directFundingTerms}
          enableMentions
          className="mt-5"
        />
      )}
      <div className="font-medium my-5">
        Select whether funds are a donation or in exchange for goods or services
      </div>
      <SelectInput
        fullWidth
        value={directFundingType}
        onChange={(e) => setDirectFundingType(e.target.value)}
      >
        <option value="DONATION">Funds received are donations.</option>
        <option value="EXCHANGE">
          We are offering goods or services in exchange for funds.
        </option>
      </SelectInput>
      {directFundingType === "EXCHANGE" && (
        <>
          <div className="font-medium mt-8">Description</div>
          <div className="my-4">
            Describe what funders will receive in exchange for their
            contribution.
          </div>
          <Wysiwyg
            defaultValue={exchangeDescription}
            onChange={(e) => setExchangeDescription(e.target.value)}
            rows={5}
            highlightColor={round.color}
          />
          <div className="font-medium mt-8 mb-4">Minimum contribution</div>
          <TextField
            placeholder="0"
            endAdornment={round.currency}
            size="large"
            color={round.color}
            inputProps={{
              value: exchangeMinimumContribution,
              onChange: (e) => setExchangeMinimumContribution(e.target.value),
              type: "number",
              min: "0.00",
              step: 0.01,
            }}
          />
        </>
      )}
      <Button
        className="mt-8"
        color={round.color}
        loading={fetchingMutation}
        onClick={() => {
          editBucket({
            bucketId: bucket.id,
            directFundingType,
            exchangeDescription,
            exchangeMinimumContribution: Number(exchangeMinimumContribution),
          }).then(({ error }) => {
            if (error) {
              console.error(error);
              toast.error(error.message);
            } else {
              exitEditing();
            }
          });
        }}
      >
        Save
      </Button>
    </>
  );
};

export default DirectFundingBucketForm;
