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
  ] = useState<number>(bucket.exchangeMinimumContribution / 100);
  const [exchangeVat, setExchangeVat] = useState<number>(
    bucket.exchangeVat ? bucket.exchangeVat / 100 : undefined
  );

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
          <div className="font-medium mt-8">Minimum contribution</div>
          <div className="my-4">
            Remember to account for payment processing fees and taxes.
          </div>
          <TextField
            placeholder="0"
            endAdornment={round.currency}
            color={round.color}
            inputProps={{
              value: exchangeMinimumContribution,
              onChange: (e) => setExchangeMinimumContribution(e.target.value),
              type: "number",
              min: "0.00",
              step: 0.01,
            }}
          />
          <div className="font-medium mt-8 mb-4">VAT</div>
          <div className="my-4">
            You may be liable for collecting VAT depending on your region. It is
            your responsibility to figure this part out.
          </div>
          <TextField
            endAdornment="%"
            color={round.color}
            inputProps={{
              value: exchangeVat,
              onChange: (e) => setExchangeVat(e.target.value),
              type: "number",
              min: "0.00",
              max: "100.00",
              step: 0.01,
            }}
          />
        </>
      )}
      <div className="flex space-x-5">
        <Button
          className="mt-8"
          color={round.color}
          loading={fetchingMutation}
          disabled={
            exchangeVat === undefined ||
            exchangeMinimumContribution < 0 ||
            exchangeVat < 0 ||
            exchangeVat > 100
          }
          onClick={() => {
            editBucket({
              bucketId: bucket.id,
              directFundingType,
              exchangeDescription,
              exchangeMinimumContribution:
                Number(exchangeMinimumContribution) * 100,
              exchangeVat: Number(exchangeVat) * 100,
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
        <Button
          className="mt-8"
          color="red"
          loading={fetchingMutation}
          onClick={() => {
            editBucket({
              bucketId: bucket.id,
              directFundingEnabled: false,
            }).then(({ error }) => {
              if (error) {
                console.error(error);
                toast.error(error.message);
              }
            });
          }}
        >
          Disable direct funding for this bucket
        </Button>
      </div>
      <div className="mt-5 text-gray-600">
        If a bucket is not fully funded, direct funds will be automatically
        refunded via Stripe to the funder.
      </div>
      {directFundingType === "EXCHANGE" && (
        <div className="mt-5 text-gray-600">
          {process.env.PLATFORM_NAME} is not responsible for the correct
          handling of taxes. If in doubt, please contact a lawyer or tax
          consultant.
        </div>
      )}
    </>
  );
};

export default DirectFundingBucketForm;
