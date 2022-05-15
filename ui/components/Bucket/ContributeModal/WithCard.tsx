import { useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Prisma } from "@prisma/client";
import Markdown from "components/Markdown";
import TextField from "components/TextField";
import SelectInput from "components/SelectInput";

const Decimal = Prisma.Decimal;

const Title = ({ children }) => (
  <div className="font-medium mt-5">{children}</div>
);

const WithCard = ({ bucket }) => {
  const isExchange = bucket.directFundingType === "EXCHANGE";

  const [contribution, setContribution] = useState<number>(
    isExchange ? bucket.exchangeMinimumContribution / 100 : 0
  );
  // fraction
  const [cobudgetTip, setCobudgetTip] = useState<number>(0.15);

  const tipAlternatives = useMemo(
    () =>
      [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3].map((fraction) => ({
        fraction,
        amount: new Decimal(fraction).mul(contribution || 0),
      })),
    [contribution]
  );

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
      <Title>
        <FormattedMessage defaultMessage="How much would you like to contribute?" />
      </Title>
      <TextField
        placeholder="0"
        endAdornment={bucket.round.currency}
        color={bucket.round.color}
        inputProps={{
          value: contribution,
          onChange: (e) => setContribution(e.target.value),
          type: "number",
          min: isExchange ? bucket.exchangeMinimumContribution / 100 : "0.00",
          step: 0.01,
        }}
      />
      {isExchange && contribution * 100 < bucket.exchangeMinimumContribution && (
        <div className="text-red-600">
          <FormattedMessage defaultMessage="Contribution needs to be at least" />{" "}
          {bucket.exchangeMinimumContribution / 100} {bucket.round.currency}
        </div>
      )}
      <Title>
        <FormattedMessage defaultMessage="Add a tip to support Cobudget" />
      </Title>
      <SelectInput
        fullWidth
        value={cobudgetTip}
        onChange={(e) => setCobudgetTip(e.target.value)}
      >
        {tipAlternatives.map(({ fraction, amount }, i) => {
          return (
            // TODO: truncate to 2 decimals
            <option value={fraction} key={fraction}>
              {amount.toString()} {bucket.round.currency} ({fraction * 100}%)
            </option>
          );
        })}
      </SelectInput>
    </div>
  );
};

export default WithCard;
