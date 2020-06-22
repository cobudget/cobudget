import { useState } from "react";
import thousandSeparator from "utils/thousandSeparator";
import IconButton from "components/IconButton";
import { EditIcon } from "components/Icons";
import { Tooltip } from "react-tippy";

import EditBudgetModal from "./EditBudgetModal";

export default ({
  budgetItems,
  dreamId,
  canEdit,
  event,
  currency,
  allowStretchGoals,
  minGoal,
  maxGoal,
}) => {
  const [editing, setEditing] = useState(false);
  const incomeItems = budgetItems.filter((item) => item.type === "INCOME");
  const expenseItems = budgetItems.filter((item) => item.type === "EXPENSE");
  return (
    <>
      {editing && (
        <EditBudgetModal
          dreamId={dreamId}
          budgetItems={budgetItems}
          currency={currency}
          allowStretchGoals={allowStretchGoals}
          handleClose={() => setEditing(false)}
          open={editing}
          event={event}
        />
      )}

      {budgetItems.length > 0 ? (
        <div className="group relative mb-4">
          <div className="flex justify-between mb-2 ">
            <h2 className="text-2xl font-medium">Budget</h2>
            {canEdit && (
              <div className="absolute top-0 right-0 invisible group-hover:visible">
                <Tooltip title="Edit budget" position="bottom" size="small">
                  <IconButton onClick={() => setEditing(true)}>
                    <EditIcon className="h-6 w-6" />
                  </IconButton>
                </Tooltip>
              </div>
            )}
          </div>
          {incomeItems.length > 0 && (
            <>
              <h3 className="font-lg font-medium mb-2">
                Income/existing funding
              </h3>

              <div className="mb-8 rounded shadow overflow-hidden bg-gray-100">
                <table className="table-fixed w-full">
                  <tbody>
                    {incomeItems.map((budgetItem, i) => (
                      <tr key={i} className="bg-gray-100 even:bg-white">
                        <td className="px-4 py-2">{budgetItem.description}</td>
                        <td className="px-4 py-2">
                          {thousandSeparator(budgetItem.min)} {currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {expenseItems.length > 0 && (
            <>
              <h3 className="font-lg font-medium mb-2">Expenses</h3>

              <div className="mb-8 rounded shadow overflow-hidden bg-gray-100">
                <table className="table-fixed w-full">
                  <tbody>
                    {expenseItems.map((budgetItem, i) => (
                      <tr key={i} className="bg-gray-100 even:bg-white">
                        <td className="px-4 py-2">{budgetItem.description}</td>
                        <td className="px-4 py-2">
                          {thousandSeparator(budgetItem.min)}
                          {budgetItem.max &&
                            ` - ${thousandSeparator(budgetItem.max)}`}{" "}
                          {currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <p className="font-lg font-medium mb-2">
            Total funding goal: {thousandSeparator(minGoal)} {currency}{" "}
            {maxGoal > 0 && (
              <>
                (stretch goal: {thousandSeparator(maxGoal)} {currency})
              </>
            )}
          </p>
        </div>
      ) : canEdit ? (
        <button
          onClick={() => setEditing(true)}
          className="block w-full h-32 text-gray-600 font-semibold rounded-lg border-3 border-dashed focus:outline-none focus:bg-gray-100 hover:bg-gray-100 mb-4"
        >
          + Add budget
        </button>
      ) : null}
    </>
  );
};
