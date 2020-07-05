import gql from "graphql-tag";
import { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import { Tooltip } from "react-tippy";

import Button from "components/Button";
import IconButton from "components/IconButton";
import { DeleteIcon, AddIcon, EditIcon } from "components/Icons";

import AddOrEditCustomField from "./AddOrEditCustomField";
import FilterLabelsAutoComplete from "./FilterLabelsAutoComplete";

const css = {
  label:
    "bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-800 mr-2",
};

const types = {
  TEXT: "Short Text",
  MULTILINE_TEXT: "Long Text",
  BOOLEAN: "Yes/No",
};

const DELETE_CUSTOM_FIELD_MUTATION = gql`
  mutation DeleteCustomField($eventId: ID!, $fieldId: ID!) {
    deleteCustomField(eventId: $eventId, fieldId: $fieldId) {
      id
      customFields {
        id
        name
        description
        type
        isRequired
        createdAt
      }
    }
  }
`;

export default ({ event }) => {
  const [addCustomFieldModalOpen, setAddCustomFieldModalOpen] = useState(false);
  const [editingCustomField, setEditingCustomField] = useState(undefined);
  
  const [deleteCustomField, { loading }] = useMutation(
    DELETE_CUSTOM_FIELD_MUTATION,
    {
      variables: { eventId: event.id },
    }
  );
  return (
    <>
      <h1 className="text-2xl font-semibold mb-2">Custom fields</h1>
      <p className="text-gray-700 mb-2">
        Custom fields are extra fields or questions for Dreams
      </p>

      <div>
        <FilterLabelsAutoComplete
          event={event}
          defaultCustomFields={event.customFields}
          filterLabels={event.filterLabels}
          className="mb-6 mt-6"
        />
      </div>

      <div className="overflow-y-scroll max-h-screen">
        {event.customFields.map((customField) => (
          <div key={customField} className="p-4 shadow rounded my-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">{customField.name}</h2>
              <div>
                <Tooltip title="Edit" position="bottom" size="small">
                  <IconButton
                    onClick={() => setEditingCustomField(customField)}
                    className="mx-1"
                  >
                    <EditIcon className="h-6 w-6" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete" position="bottom" size="small">
                  <IconButton
                    loading={loading}
                    onClick={() =>
                      confirm(
                        "Deleting a custom field would delete it from all the dreams that use it. Are you sure?"
                      ) &&
                      deleteCustomField({
                        variables: { fieldId: customField.id },
                      })
                    }
                  >
                    <DeleteIcon className="h-6 w-6" />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
            <p className="mb-2">{customField.description}</p>
            <div className="flex">
              <span className={css.label}>Type: {types[customField.type]}</span>
              {customField.isRequired && (
                <span className={css.label}>Is Required</span>
              )}
            </div>
          </div>
        ))}
      </div>

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
