import gql from "graphql-tag";
import { useState } from "react";
import { useMutation } from "@apollo/react-hooks";

import Button from "components/Button";
import { AddIcon } from "components/Icons";

import AddOrEditCustomField from "./AddOrEditCustomField";
import DraggableCustomField from "./DraggableCustomFields";

export default ({ event }) => {
  const [addCustomFieldModalOpen, setAddCustomFieldModalOpen] = useState(false);
  const [editingCustomField, setEditingCustomField] = useState(undefined);

  return (
    <>
      <h1 className="text-2xl font-semibold mb-2">Custom fields</h1>
      <p className="text-gray-700 mb-2">
        Custom fields are extra fields or questions for Dreams
      </p>

      <DraggableCustomField
        event={event}
        customFields={event.customFields}
        setEditingCustomField={setEditingCustomField}
      />

      <div className="flex my-2">
        <Button
          variant="secondary"
          onClick={() => setAddCustomFieldModalOpen(true)}
          className="flex-grow"
        >
          <AddIcon className="h-5 w-5 mr-1" /> Add custom field
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
    </>
  );
};
