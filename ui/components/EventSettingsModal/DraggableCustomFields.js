import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from "react-sortable-hoc";
import { makeStyles } from "@material-ui/core";
import { DraggableIcon } from "components/Icons";
import { Tooltip } from "react-tippy";
import IconButton from "components/IconButton";
import { DeleteIcon, EditIcon } from "components/Icons";

const SET_CUSTOM_FIELD_POSITION_MUTATION = gql`
  mutation SetCustomFieldPosition($eventId: ID!, $fieldId: ID!, $beforePosition: Float, $afterPosition: Float) {
    setCustomFieldPosition(eventId: $eventId, fieldId: $fieldId, beforePosition: $beforePosition, afterPosition: $afterPosition) {
      id
      customFields {
        id
        name
        description
        type
        isRequired
        position
        isShownOnFrontPage
        createdAt
      }
    }
  }
`;

const css = {
  label:
    "bg-gray-200 rounded-full px-3 py-1 text-sm font-medium text-gray-800 mr-2",
};

const types = {
  TEXT: "Short Text",
  MULTILINE_TEXT: "Long Text",
  BOOLEAN: "Yes/No",
};

// We need to make sure that the zIndex is bigger the material design
// modal otherwise the component disappear when dragged
export const useStyles = makeStyles(
  theme => ({
    sorting: {
      zIndex: theme.zIndex.modal + 100,
    },
  }),
);

const DragHandle = sortableHandle(() => <span className="cursor-move group-hover:text-gray-600 pr-2"><DraggableIcon className="inline h-4 w-4"/></span>);

const SortableItem = sortableElement(({customField, setEditingCustomField, deleteCustomField, loading}) => (
  <li style={{listStyleType: "none"}} className="group bg-white rounded p-2 border-dashed border-gray-600">
    {<DragHandle />}
    
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
      {customField.isShownOnFrontPage && (
        <span className={css.label}>Shown on front page</span>
      )}
    </div>
  </li>
));

const SortableContainer = sortableContainer(({children}) => {
  return <ul className="select-none">{children}</ul>
});

export default ({
  event,
  customFields,
  setEditingCustomField,
  deleteCustomField,
}) => {

  // To allow real time dragging changes - we duplicate the list locally
  const [localCustomFields, setLocalCustomFields] = useState(customFields);

  // This updated the global server custom fields with our local copy
  useEffect(() => {
    // The following prevents two requests from overriding and flickering in the ui
    if(!loading) {
      setLocalCustomFields(customFields);
    }
  }, [customFields]);

  const [setCustomFieldPosition, { loading }] = useMutation(
    SET_CUSTOM_FIELD_POSITION_MUTATION,
    {
      variables: { eventId: event.id },
    }
  );

  const classes = useStyles();

  // Extract the position of the custom fields before and after the new index to calculate the new
  // custom field position (Based on https://softwareengineering.stackexchange.com/a/195317/54663)
  const onSortEnd = ({ oldIndex, newIndex }) => {
    const customField = localCustomFields[oldIndex];
    let beforePosition;
    let afterPosition;
    let beforeCustomField;

    const afterCustomField = localCustomFields[newIndex];
    if(oldIndex > newIndex) {
      beforeCustomField = localCustomFields[newIndex - 1];
    }else {
      beforeCustomField = localCustomFields[newIndex + 1];
    }
    if(beforeCustomField) {
      beforePosition = beforeCustomField.position;
    } else {
      // Last element
      beforePosition = localCustomFields[localCustomFields.length-1].position + 1;
    } 
    if(newIndex == 0) {
      // First element
      afterPosition = localCustomFields[0].position - 1;
      beforePosition = localCustomFields[0].position;
    } else {
      afterPosition = afterCustomField.position;
    }

    // In order to replace the position locally we must duplicate the custom fields locally
    let customFieldsNew = [...localCustomFields];
    customField.position = ((beforePosition - afterPosition) / 2.0) + afterPosition;
    setLocalCustomFields(customFieldsNew);

    setCustomFieldPosition({ variables: {
      fieldId: customField.id,
      beforePosition,
      afterPosition
    }})
  };

  return (
    <SortableContainer onSortEnd={onSortEnd} useDragHandle helperClass={classes.sorting}>
      {localCustomFields.sort((a,b) => a.position - b.position).map((customField, index) => (
        <SortableItem
          key={customField.id}
          index={index}
          customField={customField}
          setEditingCustomField={setEditingCustomField}
          deleteCustomField={deleteCustomField}
          loading={loading}/>
      ))}
    </SortableContainer>
  );
}
