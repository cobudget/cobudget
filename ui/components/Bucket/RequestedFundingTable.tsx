import React, { useMemo } from "react";
import { FormattedMessage, FormattedNumber } from "react-intl";

function RequestedFundingTable({ round, bucket }) {
  const expenseTotalMin = bucket.minGoal;
  const expenseTotalMax = bucket.maxGoal;

  const expenseItems = useMemo(() => {
    return bucket.budgetItems.filter((item) => item.type === "EXPENSE");
  }, [bucket]);

  return (
    <div className="mb-8 rounded shadow overflow-hidden bg-gray-100">
      <table className="table-fixed w-full">
        <tbody>
          {expenseItems.map((budgetItem, i) => (
            <tr key={i} className="bg-gray-100 even:bg-white">
              <td
                className="px-4 py-2"
                data-testid="bucket-cost-description-view"
              >
                {budgetItem.description}
              </td>
              <td
                className="px-4 py-2"
                data-testid="bucket-cost-min-amount-view"
              >
                <FormattedNumber
                  value={budgetItem.min / 100}
                  style="currency"
                  currencyDisplay={"symbol"}
                  currency={round.currency}
                />
                {budgetItem.max && " - "}
                {budgetItem.max && (
                  <FormattedNumber
                    value={budgetItem.max / 100}
                    style="currency"
                    currencyDisplay={"symbol"}
                    currency={round.currency}
                  />
                )}
              </td>
            </tr>
          ))}
          <tr key="total" className="bg-gray-200 border-t-2 border-gray-300">
            <td className="px-4 py-2">
              <FormattedMessage defaultMessage="Total" />
            </td>
            <td className="px-4 py-2">
              <FormattedNumber
                value={expenseTotalMin / 100}
                style="currency"
                currencyDisplay={"symbol"}
                currency={round.currency}
              />
              {expenseTotalMax > 0 ? " - " : ""}
              {expenseTotalMax > 0 ? (
                <FormattedNumber
                  value={expenseTotalMax / 100}
                  style="currency"
                  currencyDisplay={"symbol"}
                  currency={round.currency}
                />
              ) : (
                ""
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default RequestedFundingTable;
