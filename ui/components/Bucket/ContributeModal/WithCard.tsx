import { useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Prisma } from "@prisma/client";
import Markdown from "components/Markdown";
import TextField from "components/TextField";
import SelectInput from "components/SelectInput";
import Button from "components/Button";

const Decimal = Prisma.Decimal;

const tipAmount = ({ fraction, contribution }) =>
  new Decimal(fraction).mul(contribution || 0).toFixed(2);

const Title = ({ children }) => (
  <div className="font-medium mt-5 mb-2">{children}</div>
);

const WithCard = ({ bucket, handleClose }) => {
  const isExchange = bucket.directFundingType === "EXCHANGE";

  const [contribution, setContribution] = useState<number>(
    isExchange ? bucket.exchangeMinimumContribution / 100 : null
  );
  // fraction
  const [cobudgetTip, setCobudgetTip] = useState<number>(0.15);

  const tipAlternatives = useMemo(
    () =>
      [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3].map((fraction) => ({
        fraction,
        amount: tipAmount({ fraction, contribution }),
      })),
    [contribution]
  );

  const notAboveMinimum =
    isExchange &&
    contribution &&
    new Decimal(contribution)
      .mul(100)
      .lessThan(bucket.exchangeMinimumContribution);

  return (
    <div>
      {isExchange && (
        <>
          <Title>
            <FormattedMessage defaultMessage="What you will receive in exchange for your contribution" />
          </Title>
          <Markdown source={bucket.exchangeDescription} />
        </>
      )}
      <form
        action={`/api/stripe/create-checkout-session?bucketId=${
          bucket.id
        }&contribution=${new Decimal(contribution || 0).mul(
          100
        )}&tipAmount=${new Decimal(
          tipAmount({ fraction: cobudgetTip, contribution })
        ).mul(100)}`}
        method="POST"
      >
        <Title>
          <FormattedMessage defaultMessage="How much would you like to contribute?" />
        </Title>
        <TextField
          placeholder="0"
          endAdornment={bucket.round.currency}
          color={bucket.round.color}
          inputProps={{
            value: contribution ?? "",
            onChange: (e) => setContribution(e.target.value),
            type: "number",
            min: isExchange ? bucket.exchangeMinimumContribution / 100 : "0.00",
            step: 0.01,
          }}
        />
        {notAboveMinimum && (
          <div className="text-red-600">
            <FormattedMessage defaultMessage="Contribution needs to be at least" />{" "}
            {bucket.exchangeMinimumContribution / 100} {bucket.round.currency}
          </div>
        )}
        <Title>
          <FormattedMessage defaultMessage="Add a tip to support Cobudget" />
        </Title>
        <div className="mb-2">
          <FormattedMessage defaultMessage="Cobudget is an open source project and does not charge transaction fees. Your generosity allows us to develop and maintain this tool." />
        </div>
        <SelectInput
          fullWidth
          value={cobudgetTip}
          onChange={(e) => setCobudgetTip(e.target.value)}
        >
          {tipAlternatives.map(({ fraction, amount }) => {
            return (
              <option value={fraction} key={fraction}>
                {amount} {bucket.round.currency} ({fraction * 100}%)
              </option>
            );
          })}
        </SelectInput>
        <Button
          type="submit"
          size="large"
          fullWidth
          color={bucket.round.color}
          disabled={notAboveMinimum || !(contribution > 0)}
          className="mt-8 mb-2"
        >
          <FormattedMessage defaultMessage="Continue" />
        </Button>
      </form>
      <Button
        size="large"
        fullWidth
        variant="secondary"
        color={bucket.round.color}
        onClick={handleClose}
      >
        <FormattedMessage defaultMessage="Cancel" />
      </Button>
    </div>
  );
};

export default WithCard;
