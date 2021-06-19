import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import { sortableContainer } from "react-sortable-hoc";
import { cloneDeep } from "lodash";

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
  currentOrg,
}) => {
  // To allow real time dragging changes - we duplicate the list locally
  const [localItems, setLocalItems] = useState(cloneDeep(items));

  // This updated the global server items with our local copy
  useEffect(() => {
    // The following prevents two requests from overriding and flickering in the ui
    if (!setPositionLoading) {
      setLocalItems(cloneDeep(items));
    }
  }, [items, setPositionLoading]);

  const classes = useStyles();

  // Extract the position of the items before and after the new index to calculate the new
  // item position (Based on https://softwareengineering.stackexchange.com/a/195317/54663)
  const onSortEnd = ({ oldIndex, newIndex }) => {
    let beforePosition;
    let afterPosition;
    let beforeItem;

    const afterItem = localItems[newIndex];
    if (oldIndex > newIndex) {
      beforeItem = localItems[newIndex - 1];
    } else {
      beforeItem = localItems[newIndex + 1];
    }
    if (beforeItem) {
      beforePosition = beforeItem.position;
    } else {
      // Last element
      beforePosition = localItems[localItems.length - 1].position + 1;
    }
    if (newIndex == 0) {
      // First element
      afterPosition = localItems[0].position - 1;
      beforePosition = localItems[0].position;
    } else {
      afterPosition = afterItem.position;
    }

    const newPosition = (beforePosition - afterPosition) / 2.0 + afterPosition;
    const item = localItems[oldIndex];
    item.position = newPosition;
    setLocalItems(localItems);

    setItemPosition(item.id, newPosition);
  };

  return (
    <SortableContainer
      onSortEnd={onSortEnd}
      useDragHandle
      helperClass={classes.sorting}
    >
      {localItems
        // lol this sort actually mutates localItems, which turns out to be
        // central to the functioning of this
        .sort((a, b) => a.position - b.position)
        .map((item, index) => (
          <SortableItem
            key={item.id}
            index={index}
            item={item}
            setEditingItem={setEditingItem}
            eventId={event.id}
            currentOrg={currentOrg}
          />
        ))}
    </SortableContainer>
  );
};

export default DraggableItems;
