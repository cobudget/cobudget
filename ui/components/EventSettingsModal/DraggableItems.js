import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import { sortableContainer } from "react-sortable-hoc";

// We need to make sure that the zIndex is bigger the material design
// modal otherwise the component disappear when dragged
export const useStyles = makeStyles((theme) => ({
  sorting: {
    zIndex: theme.zIndex.modal + 100,
  },
}));

const SortableContainer = sortableContainer(({ children }) => {
  return <ul className="select-none">{children}</ul>;
});

const DraggableItems = ({
  event,
  items,
  setItemPosition,
  setPositionLoading,
  SortableItem,
  setEditingItem,
}) => {
  // To allow real time dragging changes - we duplicate the list locally
  const [localCustomFields, setLocalCustomFields] = useState(items);

  // This updated the global server custom fields with our local copy
  useEffect(() => {
    // The following prevents two requests from overriding and flickering in the ui
    if (!setPositionLoading) {
      setLocalCustomFields(items);
    }
  }, [items, setPositionLoading]);

  const classes = useStyles();

  // Extract the position of the custom fields before and after the new index to calculate the new
  // custom field position (Based on https://softwareengineering.stackexchange.com/a/195317/54663)
  const onSortEnd = ({ oldIndex, newIndex }) => {
    const customField = localCustomFields[oldIndex];
    let beforePosition;
    let afterPosition;
    let beforeCustomField;

    const afterCustomField = localCustomFields[newIndex];
    if (oldIndex > newIndex) {
      beforeCustomField = localCustomFields[newIndex - 1];
    } else {
      beforeCustomField = localCustomFields[newIndex + 1];
    }
    if (beforeCustomField) {
      beforePosition = beforeCustomField.position;
    } else {
      // Last element
      beforePosition =
        localCustomFields[localCustomFields.length - 1].position + 1;
    }
    if (newIndex == 0) {
      // First element
      afterPosition = localCustomFields[0].position - 1;
      beforePosition = localCustomFields[0].position;
    } else {
      afterPosition = afterCustomField.position;
    }

    // In order to replace the position locally we must duplicate the custom fields locally
    let customFieldsNew = [...localCustomFields];
    const newPosition = (beforePosition - afterPosition) / 2.0 + afterPosition;
    customField.position = newPosition;
    setLocalCustomFields(customFieldsNew);

    setItemPosition(customField.id, newPosition);
  };

  return (
    <SortableContainer
      onSortEnd={onSortEnd}
      useDragHandle
      helperClass={classes.sorting}
    >
      {localCustomFields
        .sort((a, b) => a.position - b.position)
        .map((item, index) => (
          <SortableItem
            key={item.id}
            index={index}
            item={item}
            setEditingItem={setEditingItem}
            eventId={event.id}
          />
        ))}
    </SortableContainer>
  );
};

export default DraggableItems;
