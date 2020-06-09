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
}) => {
  const [editing, setEditing] = useState(false);

  return (
    <>
      {editing && (
        <EditBudgetModal
          dreamId={dreamId}
          initialBudgetItems={budgetItems}
          currency={currency}
          allowStretchGoals={allowStretchGoals}
          handleClose={() => setEditing(false)}
          open={editing}
          event={event}
        />
      )}

      {budgetItems.length > 0 ? (
        <div className="group relative">
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
          <div className="mb-8 rounded shadow overflow-hidden bg-gray-100">
            <table className="table-fixed w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 w-3/4 border-b text-left font-medium">
                    Description
                  </th>
                  <th className="px-4 py-2 border-b text-left font-medium">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {budgetItems.map((budgetItem, i) => (
                  <tr key={i} className="bg-white even:bg-gray-100">
                    <td className=" px-4 py-2">{budgetItem.description}</td>
                    <td className=" px-4 py-2">
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

// <>
// <div className="my-5 rounded bg-gray-100 shadow overflow-hidden">
//   {/* <h2 className="mb-1 uppercase tracking-wide font-medium p-2">
//     Budget
//   </h2> */}
//   <table className="table-fixed w-full">
//     <thead>
//       <tr>
//         <th className="px-4 py-2 w-3/4">Description</th>
//         <th className="px-4 py-2">Amount</th>
//       </tr>
//     </thead>
//     <tbody>
//       {budgetItems.map((budgetItem, i) => (
//         <tr key={i} className="bg-white even:bg-gray-100">
//           <td className="border px-4 py-2">{budgetItem.description}</td>
//           <td className="border px-4 py-2">
//             {budgetItem.min}
//             {budgetItem.max && ` - ${budgetItem.max}`} {currency}
//           </td>
//         </tr>
//       ))}
//     </tbody>
//   </table>
// </div>
// </>
