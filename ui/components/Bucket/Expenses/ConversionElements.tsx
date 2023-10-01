import FormattedCurrency from "components/FormattedCurrency";
import { EXPENSE_PAID } from "../../../constants";
import dayjs from "dayjs";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

export const FrozenExpenseAmount = ({ expense, round }) => {
  const rate = expense.amount / expense.exchangeRate;

  return <FormattedCurrency currency={round?.currency} value={rate} />;
};

export const ConversionReason = ({
  expense,
  round,
  roundCurrencyRate,
  roundConversionRates,
}) => {
  const [mouseIn, setMouseIn] = useState(false);

  if (expense.currency === round?.currency) {
    return null;
  }
  if (expense.status === EXPENSE_PAID && expense.exchangeRate) {
    return (
      <span
        className="group"
        onMouseEnter={() => {
          setMouseIn(true);
        }}
        onMouseLeave={() => {
          setMouseIn(false);
        }}
      >
        <span className="absolute mt-1 text-sm cursor-pointer text-white font-bold rounded-full bg-gray-700 ml-2 w-4 h-4 inline-flex justify-center items-center">
          ?
        </span>
        {mouseIn && (
          <div className="right-0 md:right-auto mt-6 w-full md:w-96 opacity-0 group-hover:opacity-100 absolute duration-300 z-10 inline-block px-3 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg shadow-sm">
            <FormattedMessage
              defaultMessage="The expense was paid at {paidAt}. The exchange rate was {c1} = {c2} at that time."
              values={{
                paidAt: dayjs(expense.paidAt).format("DD/MM/YYYY hh:mm a"),
                c1: (
                  <FormattedCurrency value={100} currency={round?.currency} />
                ),
                c2: (
                  <FormattedCurrency
                    value={parseInt(
                      (expense.exchangeRate / roundCurrencyRate) * 100 + ""
                    )}
                    currency={expense.currency}
                  />
                ),
              }}
            />
          </div>
        )}
      </span>
    );
  }
  if (roundConversionRates[expense.currency]) {
    return (
      <span
        className="group"
        onMouseEnter={() => {
          setMouseIn(true);
        }}
        onMouseLeave={() => {
          setMouseIn(false);
        }}
      >
        <span className="absolute mt-1 text-sm cursor-pointer text-white font-bold rounded-full bg-gray-700 ml-2 w-4 h-4 inline-flex justify-center items-center">
          ?
        </span>
        {mouseIn && (
          <div className="right-0 md:right-auto mt-6 w-full md:w-96 opacity-0 group-hover:opacity-100 absolute duration-300 z-10 inline-block px-3 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg shadow-sm">
            <FormattedMessage
              defaultMessage="Exchange rate is {roundCurrency} = {convertedCurrency}"
              values={{
                roundCurrency: (
                  <FormattedCurrency value={100} currency={round.currency} />
                ),
                convertedCurrency: (
                  <FormattedCurrency
                    value={parseInt(
                      roundConversionRates[expense.currency] * 100 + ""
                    )}
                    currency={expense.currency}
                  />
                ),
              }}
            />
          </div>
        )}
      </span>
    );
  }
  return null;
};
