import { useState } from "react";
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
      
      { 
      <button
        onClick={() => setEditing(true)}
        className="mt-4 p-2 mb-2 flex items-center bg-gray-300 hover:bg-gray-400 text-gray-700 focus:outline-none rounded-md focus:shadow-outline"
      >
        <span>Set custom fields</span>
      </button>     
    }
    </>
  );
};
