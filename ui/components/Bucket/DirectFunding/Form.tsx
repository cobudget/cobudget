import { useState } from "react";
import toast from "react-hot-toast";
import { Prisma } from "@prisma/client";
import { FormattedMessage, useIntl } from "react-intl";
import Markdown from "components/Markdown";
import Button from "components/Button";
import SelectInput from "components/SelectInput";
import Wysiwyg from "components/Wysiwyg";
import TextField from "components/TextField";

const Decimal = Prisma.Decimal;

const DirectFundingBucketForm = ({
  bucket,
  editBucket,
  fetchingMutation,
  round,
  exitEditing,
}) => {
  const intl = useIntl();
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

  const isExchange = directFundingType === "EXCHANGE";

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
        <FormattedMessage defaultMessage="Select whether funds are a donation or in exchange for goods or services" />
      </div>
      <SelectInput
        fullWidth
        value={directFundingType}
        onChange={(e) => setDirectFundingType(e.target.value)}
      >
        <option value="DONATION">
          {intl.formatMessage({
            defaultMessage: "Funds received are donations.",
          })}
        </option>
        <option value="EXCHANGE">
          {intl.formatMessage({
            defaultMessage:
              "We are offering goods or services in exchange for funds.",
          })}
        </option>
      </SelectInput>
      {isExchange && (
        <>
          <div className="font-medium mt-8">
            <FormattedMessage defaultMessage="Description" />
          </div>
          <div className="my-4">
            <FormattedMessage defaultMessage="Describe what funders will receive in exchange for their contribution." />
          </div>
          <Wysiwyg
            defaultValue={exchangeDescription}
            onChange={(e) => setExchangeDescription(e.target.value)}
            rows={5}
            highlightColor={round.color}
          />
          <div className="font-medium mt-8">
            <FormattedMessage defaultMessage="Minimum contribution" />
          </div>
          <div className="my-4">
            <FormattedMessage defaultMessage="Remember to account for payment processing fees and taxes." />
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
          <div className="font-medium mt-8 mb-4">
            <FormattedMessage defaultMessage="VAT" />
          </div>
          <div className="my-4">
            <FormattedMessage defaultMessage="You may be liable for collecting VAT depending on your region. It is your responsibility to figure this part out." />
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
            isExchange &&
            (exchangeVat === undefined ||
              exchangeMinimumContribution < 0 ||
              exchangeVat < 0 ||
              exchangeVat > 100)
          }
          onClick={() => {
            editBucket({
              bucketId: bucket.id,
              directFundingType,
              exchangeDescription,
              exchangeMinimumContribution: new Decimal(
                exchangeMinimumContribution
              )
                .mul(100)
                .round()
                .toNumber(),
              exchangeVat: new Decimal(exchangeVat).mul(100).round().toNumber(),
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
          <FormattedMessage defaultMessage="Save" />
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
          <FormattedMessage defaultMessage="Disable direct funding for this bucket" />
        </Button>
      </div>
      <div className="mt-5 text-gray-600">
        <FormattedMessage defaultMessage="If a bucket is not fully funded, direct funds will be automatically refunded via Stripe to the funder." />
      </div>
      {isExchange && (
        <div className="mt-5 text-gray-600">
          <FormattedMessage
            defaultMessage="{platform} is not responsible for the correct handling of taxes. If in doubt, please contact a lawyer or tax consultant."
            values={{
              platform: process.env.PLATFORM_NAME,
            }}
          />
        </div>
      )}
    </>
  );
};

export default DirectFundingBucketForm;
