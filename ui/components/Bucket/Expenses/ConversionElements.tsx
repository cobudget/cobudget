import FormattedCurrency from "components/FormattedCurrency";
import { EXPENSE_PAID } from "../../../constants";
import dayjs from "dayjs";

export const FrozenExpenseAmount = ({ expense, round, roundCurrencyRate }) => {
  const rate = (expense.amount / expense.exchangeRate) * roundCurrencyRate;

  return <FormattedCurrency currency={round?.currency} value={rate} />;
};

export const ConversionReason = ({ expense, round, roundCurrencyRate }) => {
  if (expense.currency === round?.currency) {
    return null;
  }
  if (expense.status === EXPENSE_PAID && expense.exchangeRate) {
    return (
      <span className="group">
        <span className="text-sm cursor-pointer text-white font-bold rounded-full bg-gray-700 ml-2 w-4 h-4 inline-flex justify-center items-center">
          ?
        </span>
        <div className="w-96 opacity-0 group-hover:opacity-100 absolute duration-300 z-10 inline-block px-3 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg shadow-sm">
          The expense was paid at{" "}
          {dayjs(expense.paidAt).format("DD/MM/YYYY hh:mm a")}. The exchange
          rate was <FormattedCurrency value={100} currency={round?.currency} />{" "}
          ={" "}
          <FormattedCurrency
            value={parseInt(
              (expense.exchangeRate / roundCurrencyRate) * 100 + ""
            )}
            currency={expense.currency}
          />{" "}
          at that time.
          <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
      </span>
    );
  }
  return null;
};
