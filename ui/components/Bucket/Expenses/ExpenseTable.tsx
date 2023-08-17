import FormattedCurrency from "components/FormattedCurrency";
import { LoaderIcon } from "components/Icons";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { gql, useQuery } from "urql";
import ExpenseStatus from "./ExpenseStatus";
import { EXPENSE_PAID, EXPENSE_REJECTED } from "../../../constants";
import { ConversionReason, FrozenExpenseAmount } from "./ConversionElements";

const CONVERT_CURRENCY = gql`
  query ConvertCurrency(
    $amounts: [AmountConversionInput]!
    $toCurrency: String!
  ) {
    convertCurrency(amounts: $amounts, toCurrency: $toCurrency)
  }
`;

const EXCHANGE_RATES = gql`
  query ExchangeRates($currencies: [String]) {
    exchangeRates(currencies: $currencies) {
      currency
      rate
    }
  }
`;

function ExpenseTable({ expenses: allExpenses, round, currentUser, rejected }) {
  const { pathname, query } = useRouter();

  const expenses = useMemo(() => {
    if (!allExpenses) {
      return [];
    }
    if (typeof rejected === "undefined") {
      return allExpenses;
    }
    if (rejected) {
      return allExpenses.filter((e) => e.status === EXPENSE_REJECTED);
    }
    return allExpenses.filter((e) => e.status !== EXPENSE_REJECTED);
  }, [allExpenses, rejected]);

  const partialTotal = useMemo(() => {
    const sums = {};
    expenses.forEach((e) => {
      const currency = e.currency || round.currency;
      if (sums[currency]) {
        sums[currency] += e.amount;
      } else {
        sums[currency] = e.amount;
      }
    });
    return Object.keys(sums).map((key) => ({
      currency: key,
      amount: sums[key],
    }));
  }, [expenses, round]);
  const pauseConversion =
    partialTotal.length === 0 ||
    (partialTotal.length === 1 &&
      partialTotal[0]?.currency === round?.currency);

  const [{ fetching: converting, data: convertedTotal }] = useQuery({
    query: CONVERT_CURRENCY,
    pause: pauseConversion,
    variables: {
      amounts: partialTotal,
      toCurrency: round.currency,
    },
  });

  // Other currency is true, if an expense contains amount
  // other than the round currency
  const otherCurrency = useMemo(() => {
    const allCurrencies = Object.keys(partialTotal);
    return allCurrencies.some((c) => c !== round?.currency);
  }, [partialTotal, round?.currency]);

  const [{ data: exchangeRates }] = useQuery({
    query: EXCHANGE_RATES,
    pause: !otherCurrency,
    variables: {
      currencies: [
        ...Array.from(new Set(allExpenses.map((e) => e.currency))),
        round?.currency,
      ],
    },
  });

  const roundConversionRates = useMemo(() => {
    const map = {};
    const roundRate = exchangeRates?.exchangeRates?.find(
      (r) => r.currency === round?.currency
    )?.rate;
    exchangeRates?.exchangeRates?.forEach((r) => {
      map[r.currency] = r.rate / roundRate;
    });
    return map;
  }, [round?.currency, exchangeRates]);

  const total =
    expenses.reduce((acc, expense) => {
      return parseInt(acc || 0) + (expense.amount || 0);
    }, 0) || 0;

  if (expenses.length === 0) {
    return (
      <p className="my-2 text-gray-400">
        <FormattedMessage
          defaultMessage="This bucket does not have any {type} expense"
          values={{
            type: rejected ? "rejected" : "",
          }}
        />
      </p>
    );
  }

  return (
    <div className="my-2 mb-8 rounded shadow overflow-hidden bg-gray-100">
      <table className="table-fixed w-full">
        <tbody>
          {expenses.map((expense) => {
            return (
              <tr className="bg-gray-100 even:bg-white" key={expense.id}>
                <td className="px-4 py-2">
                  <Link
                    href={{
                      pathname: pathname,
                      query: { ...query, expense: expense.id },
                    }}
                    passHref
                    shallow
                    replace
                  >
                    <span className="underline cursor-pointer">
                      {expense.title}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <FormattedCurrency
                    value={expense.amount}
                    currency={expense.currency || round.currency}
                  />
                  <ExpenseStatus expense={expense} currentUser={currentUser} />
                </td>
                {otherCurrency && (
                  <td className="px-4 py-2">
                    {expense.status === EXPENSE_PAID &&
                    expense.exchangeRate &&
                    expense.currency !== round?.currency ? (
                      <FrozenExpenseAmount
                        expense={expense}
                        round={round}
                        roundCurrencyRate={
                          exchangeRates?.exchangeRates?.find(
                            (e) => e.currency === round?.currency
                          )?.rate
                        }
                      />
                    ) : (
                      <FormattedCurrency
                        value={
                          expense.amount /
                          roundConversionRates[expense.currency]
                        }
                        currency={round.currency}
                      />
                    )}
                    <ConversionReason
                      expense={expense}
                      round={round}
                      roundCurrencyRate={
                        exchangeRates?.exchangeRates?.find(
                          (e) => e.currency === round?.currency
                        )?.rate
                      }
                    />
                  </td>
                )}
              </tr>
            );
          })}
          <tr className="bg-gray-200 border-t-2 border-gray-300 font-medium">
            <td className="px-4 py-2">
              <FormattedMessage defaultMessage="Total" />
            </td>
            {otherCurrency && <td />}
            <td className="px-4 py-2">
              {converting ? (
                <LoaderIcon className="animate-spin" width={20} height={20} />
              ) : (
                <FormattedCurrency
                  value={convertedTotal?.convertCurrency || total}
                  currency={round.currency}
                />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseTable;
