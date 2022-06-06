import { useState } from "react";
import thousandSeparator from "utils/thousandSeparator";
import IconButton from "components/IconButton";
import { EditIcon } from "components/Icons";
import { Tooltip } from "react-tippy";
import { FormattedMessage, FormattedNumber } from "react-intl";

import EditBudgetModal from "./EditBudgetModal";

const BucketBudget = ({
  bucket,
  canEdit,
  currency,
  allowStretchGoals,
  minGoal,
  maxGoal,
}) => {
  const { budgetItems } = bucket;
  const [editing, setEditing] = useState(false);
  const incomeItems = budgetItems.filter((item) => item.type === "INCOME");
  const monetaryIncome = incomeItems.filter((item) => item.min > 0);
  const nonMonetaryIncome = incomeItems.filter((item) => item.min === 0);
  const expenseItems = budgetItems.filter((item) => item.type === "EXPENSE");

  // All the below is in cents so needs to be divided by 100 when rendering
  const expenseTotalMin = minGoal;
  const expenseTotalMax = maxGoal;
  const incomeTotal = monetaryIncome
    .map((e) => e.min)
    .reduce((a, b) => a + b, 0);
  const goalTotalMin = expenseTotalMin - incomeTotal;
  const goalTotalMax = expenseTotalMax - incomeTotal;

  return (
    <>
      {editing && (
        <EditBudgetModal
          bucket={bucket}
          budgetItems={budgetItems}
          currency={currency}
          allowStretchGoals={allowStretchGoals}
          handleClose={() => setEditing(false)}
          open={editing}
        />
      )}

      {budgetItems.length > 0 ? (
        <div className="relative mb-4">
          <div className="flex justify-between mb-2 ">
            <h2 className="text-2xl font-medium">
              <FormattedMessage defaultMessage="Budget" />
            </h2>
            {canEdit && (
              <div>
                <Tooltip title="Edit budget" position="bottom" size="small">
                  <IconButton onClick={() => setEditing(true)}>
                    <EditIcon className="h-6 w-6" />
                  </IconButton>
                </Tooltip>
              </div>
            )}
          </div>
          {expenseItems.length > 0 && (
            <>
              <h3 className="font-lg font-medium mb-2">
                <FormattedMessage defaultMessage="Costs" />
              </h3>

              <div className="mb-8 rounded shadow overflow-hidden bg-gray-100">
                <table className="table-fixed w-full">
                  <tbody>
                    {expenseItems.map((budgetItem, i) => (
                      <tr key={i} className="bg-gray-100 even:bg-white">
                        <td className="px-4 py-2">{budgetItem.description}</td>
                        <td className="px-4 py-2">
                          <FormattedNumber
                            value={budgetItem.min / 100}
                            style="currency"
                            currencyDisplay={"symbol"}
                            currency={currency}
                          />
                          {budgetItem.max &&
                            ` - ${thousandSeparator(
                              budgetItem.max / 100
                            )}`}{" "}
                          {currency}
                        </td>
                      </tr>
                    ))}
                    <tr
                      key="total"
                      className="bg-gray-200 border-t-2 border-gray-300"
                    >
                      <td className="px-4 py-2">
                        <FormattedMessage defaultMessage="Total" />
                      </td>
                      <td className="px-4 py-2">
                        <FormattedNumber
                          value={expenseTotalMin / 100}
                          style="currency"
                          currencyDisplay={"symbol"}
                          currency={currency}
                        />
                        {expenseTotalMax > 0
                          ? " - " + thousandSeparator(expenseTotalMax / 100)
                          : ""}{" "}
                        {currency}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
          {monetaryIncome.length > 0 && (
            <>
              <h3 className="font-lg font-medium mb-2">
                <FormattedMessage defaultMessage="Existing funds" />
              </h3>

              <div className="mb-8 rounded shadow overflow-hidden bg-gray-100">
                <table className="table-fixed w-full">
                  <tbody>
                    {monetaryIncome.map((budgetItem) => (
                      <tr
                        key={budgetItem.id}
                        className="bg-gray-100 even:bg-white"
                      >
                        <td className="px-4 py-2">{budgetItem.description}</td>
                        <td className="px-4 py-2">
                          {thousandSeparator(budgetItem.min / 100)} {currency}
                        </td>
                      </tr>
                    ))}
                    <tr
                      key="total"
                      className="bg-gray-200 border-t-2 border-gray-300"
                    >
                      <td className="px-4 py-2">
                        <FormattedMessage defaultMessage="Total" />
                      </td>
                      <td className="px-4 py-2">
                        <FormattedNumber
                          value={incomeTotal / 100}
                          style="currency"
                          currencyDisplay={"symbol"}
                          currency={currency}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
          {nonMonetaryIncome.length > 0 && (
            <>
              <h3 className="font-lg font-medium mb-2">
                <FormattedMessage defaultMessage="Non-monetary contributions" />
              </h3>

              <div className="mb-8 rounded shadow overflow-hidden bg-gray-100">
                <table className="table-fixed w-full">
                  <tbody>
                    {nonMonetaryIncome.map((budgetItem) => (
                      <tr
                        key={budgetItem.id}
                        className="bg-gray-100 even:bg-white"
                      >
                        <td className="px-4 py-2">{budgetItem.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="text-lg font-medium mb-2 gap-x-4 gap-y-2 flex flex-wrap justify-between">
            <div>
              <div className="font-bold">
                <FormattedMessage defaultMessage="Funding goal:" />
              </div>
              <div className="text-base">
                <FormattedMessage defaultMessage="= Costs - Existing funds" />
              </div>
            </div>
            <div className="self-end">
              <span className="font-bold">
                <FormattedNumber
                  value={goalTotalMin / 100}
                  style="currency"
                  currencyDisplay={"symbol"}
                  currency={currency}
                />
              </span>
              {maxGoal > 0 && (
                <>
                  {" "}
                  (<FormattedMessage defaultMessage="stretch goal:" />{" "}
                  <span className="font-bold">
                    <FormattedNumber
                      value={goalTotalMax / 100}
                      style="currency"
                      currencyDisplay={"symbol"}
                      currency={currency}
                    />
                  </span>
                  )
                </>
              )}
            </div>
          </div>
        </div>
      ) : canEdit ? (
        <button
          onClick={() => setEditing(true)}
          className="block w-full h-32 text-gray-600 font-semibold rounded-lg border-3 border-dashed focus:outline-none focus:bg-gray-100 hover:bg-gray-100 mb-4"
        >
          <FormattedMessage defaultMessage="+ Budget" />
        </button>
      ) : null}
    </>
  );
};

export default BucketBudget;
