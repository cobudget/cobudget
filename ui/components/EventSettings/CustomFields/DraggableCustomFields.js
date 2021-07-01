import { useMutation, gql } from "@apollo/client";
import { sortableElement, sortableHandle } from "react-sortable-hoc";
import { DraggableIcon } from "components/Icons";
import { Tooltip } from "react-tippy";
import IconButton from "components/IconButton";
import { DeleteIcon, EditIcon } from "components/Icons";
import DraggableItems from "../DraggableItems";
import dreamName from "utils/dreamName";

const DELETE_CUSTOM_FIELD_MUTATION = gql`
  mutation DeleteCustomField($eventId: ID!, $fieldId: ID!) {
    deleteCustomField(eventId: $eventId, fieldId: $fieldId) {
      id
      customFields {
        id
        name
        description
        type
        limit
        isRequired
        position
        createdAt
      }
    }
  }
`;

const SET_CUSTOM_FIELD_POSITION_MUTATION = gql`
  mutation SetCustomFieldPosition(
    $eventId: ID!
    $fieldId: ID!
    $newPosition: Float
  ) {
    setCustomFieldPosition(
      eventId: $eventId
      fieldId: $fieldId
      newPosition: $newPosition
    ) {
      id
      customFields {
        id
        name
        description
        type
        limit
        isRequired
        position
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

const DragHandle = sortableHandle(() => (
  <IconButton className="mx-1 cursor-move">
    <DraggableIcon className="h-6 w-6" />
  </IconButton>
));

const SortableItem = sortableElement(
  ({
    item: customField,
    setEditingItem: setEditingCustomField,
    eventId,
    currentOrg,
  }) => {
    const [deleteCustomField, { loading: deleting }] = useMutation(
      DELETE_CUSTOM_FIELD_MUTATION,
      {
        variables: { eventId, fieldId: customField.id },
      }
    );

    return (
      <li className="group bg-white p-4 mb-3 rounded shadow list-none">
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
                loading={deleting}
                onClick={() =>
                  confirm(
                    `Deleting a custom field would delete it from all the ${dreamName(
                      currentOrg
                    )}s that use it. Are you sure?`
                  ) && deleteCustomField()
                }
              >
                <DeleteIcon className="h-6 w-6" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Drag to reorder" position="bottom" size="small">
              <DragHandle />
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
      </li>
    );
  }
);

const DraggableCustomFields = ({
  event,
  items,
  setEditingItem,
  currentOrg,
}) => {
  const [setCustomFieldPosition, { loading }] = useMutation(
    SET_CUSTOM_FIELD_POSITION_MUTATION,
    {
      variables: { eventId: event.id },
    }
  );

  const setItemPosition = (customFieldId, newPosition) => {
    setCustomFieldPosition({
      variables: {
        fieldId: customFieldId,
        newPosition,
      },
    });
  };

  return (
    <DraggableItems
      event={event}
      items={items}
      setItemPosition={setItemPosition}
      setPositionLoading={loading}
      SortableItem={SortableItem}
      setEditingItem={setEditingItem}
      currentOrg={currentOrg}
    />
  );
};

export default DraggableCustomFields;
