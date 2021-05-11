import { useState } from "react";

import Button from "components/Button";
import { AddIcon } from "components/Icons";

import AddOrEditCustomField from "./AddOrEditCustomField";
import DraggableCustomField from "./DraggableCustomFields";

const CustomFields = ({ event }) => {
  const [addCustomFieldModalOpen, setAddCustomFieldModalOpen] = useState(false);
  const [editingCustomField, setEditingCustomField] = useState(undefined);

  return (
    <div className="px-6">
      <h1 className="text-2xl font-semibold mb-2">Questions</h1>

      <p className="text-gray-700 mb-4">
        Add questions for Dreams to answer.
      </p>

      <DraggableCustomField
        event={event}
        items={event.customFields}
        setEditingItem={setEditingCustomField}
      />

      <div className="flex my-2">
        <Button
          variant="secondary"
          color={event.color}
          onClick={() => setAddCustomFieldModalOpen(true)}
          className="flex-grow"
        >
          <AddIcon className="h-5 w-5 mr-1" /> Add custom question
        </Button>
      </div>
      {(addCustomFieldModalOpen || editingCustomField) && (
        <AddOrEditCustomField
          event={event}
          customField={editingCustomField}
          handleClose={() => {
            setAddCustomFieldModalOpen(false);
            setEditingCustomField(undefined);
          }}
        />
      )}
    </div>
  );
};

export default CustomFields;
