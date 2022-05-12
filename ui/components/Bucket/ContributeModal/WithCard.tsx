import { useState } from "react";
import { FormattedMessage } from "react-intl";
import Markdown from "components/Markdown";
import TextField from "components/TextField";

const Title = ({ children }) => <div className="font-medium">{children}</div>;

const WithCard = ({ bucket }) => {
  const isExchange = bucket.directFundingType === "EXCHANGE";

  const [contribution, setContribution] = useState<number>(
    isExchange ? bucket.exchangeMinimumContribution / 100 : 0
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
          Contribution needs to be at least{" "}
          {bucket.exchangeMinimumContribution / 100} {bucket.round.currency}
        </div>
      )}
    </div>
  );
};

export default WithCard;
