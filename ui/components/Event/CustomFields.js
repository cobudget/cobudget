import { useState } from "react";
import IconButton from "../IconButton";
import { EditIcon } from "../Icons";
import { Tooltip } from "react-tippy";

import CustomFieldsModal from "./CustomFieldsModal";

export default ({
  customFields,
  event,
}) => {
  const [editing, setEditing] = useState(false);

  return (
    <>
      {editing && (
        <CustomFieldsModal
          initialCustomFields={customFields}
          handleClose={() => setEditing(false)}
          open={editing}
          event={event}
        />
      )}

      {customFields && customFields.length > 0 ? (
        <div className="group relative">
          <div className="flex justify-between mb-2 ">
            <h2 className="text-2xl font-medium">Custom Fields</h2>
            <div className="absolute top-0 right-0 invisible group-hover:visible">
              <Tooltip title="Edit custom fields" position="bottom" size="small">
                <IconButton onClick={() => setEditing(true)}>
                  <EditIcon className="h-6 w-6" />
                </IconButton>
              </Tooltip>
            </div>
          </div>
          <div className="mb-8 rounded shadow overflow-hidden bg-gray-100">
            <table className="table-fixed w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 w-3/4 border-b text-left font-medium">
                    Name
                  </th>
                  <th className="px-4 py-2 border-b text-left font-medium">
                    Description
                  </th>
                  <th className="px-4 py-2 border-b text-left font-medium">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {customFields.map((customField, i) => (
                  <tr key={i} className="bg-white even:bg-gray-100">
                    <td className=" px-4 py-2">{customField.name}</td>
                    <td className=" px-4 py-2">{customField.description}</td>
                    <td className=" px-4 py-2">{customField.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) :
      
      <button
        onClick={() => setEditing(true)}
        className="block w-full h-32 text-gray-600 font-semibold rounded-lg border-3 border-dashed focus:outline-none focus:bg-gray-100 hover:bg-gray-100 mb-4"
      >
        + Add custom fields
      </button>
      }
    </>
  );
};
