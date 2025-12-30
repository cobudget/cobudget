import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cloneDeep } from "lodash";

const DraggableItems = ({
  round,
  items,
  setItemPosition,
  setPositionLoading,
  ItemComponent,
  setEditingItem,
}) => {
  // To allow real time dragging changes - we duplicate the list locally
  const [localItems, setLocalItems] = useState(cloneDeep(items));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // This updated the global server items with our local copy
  useEffect(() => {
    // The following prevents two requests from overriding and flickering in the ui
    if (!setPositionLoading) {
      setLocalItems(cloneDeep(items));
    }
  }, [items, setPositionLoading]);

  // Extract the position of the items before and after the new index to calculate the new
  // item position (Based on https://softwareengineering.stackexchange.com/a/195317/54663)
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localItems.findIndex((item) => item.id === active.id);
    const newIndex = localItems.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

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
    if (newIndex === 0) {
      // First element
      afterPosition = localItems[0].position - 1;
      beforePosition = localItems[0].position;
    } else {
      afterPosition = afterItem.position;
    }

    const newPosition = (beforePosition - afterPosition) / 2.0 + afterPosition;
    const item = localItems[oldIndex];
    item.position = newPosition;

    // Create a new array with updated positions for proper React state update
    const updatedItems = [...localItems];
    setLocalItems(updatedItems);

    setItemPosition(item.id, newPosition);
  };

  const sortedItems = localItems
    ? [...localItems].sort((a, b) => a.position - b.position)
    : [];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="select-none">
          {sortedItems.map((item) => (
            <ItemComponent
              key={item.id}
              item={item}
              setEditingItem={setEditingItem}
              roundId={round.id}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};

export default DraggableItems;
