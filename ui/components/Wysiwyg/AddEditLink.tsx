import {
  useActive,
  useCommands,
  useCurrentSelection,
  useAttrs,
  FloatingToolbar,
  FloatingWrapper,
} from "@remirror/react";

// ComponentItem enum was removed in newer remirror versions - define locally
const ComponentItem = {
  ToolbarGroup: "group" as const,
  ToolbarCommandButton: "command" as const,
  ToolbarButton: "button" as const,
};
import { DeleteIcon, ChainIcon } from "components/Icons";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const AddEditLink = () => {
  const active = useActive();
  const activeLink = active.link();
  const [isEditing, setIsEditing] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [inputPosition, setInputPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const { empty } = useCurrentSelection();
  const { focus, updateLink, removeLink } = useCommands();
  const currentUrl = (useAttrs().link()?.href as string) ?? "";
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [isEditing]);

  const handleStartEditing = () => {
    // Capture the current selection position before anything changes
    const selection = window.getSelection();
    console.log("handleStartEditing called", { selection, rangeCount: selection?.rangeCount });

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      console.log("Selection rect", rect);

      // Use fixed positioning with viewport coordinates
      if (rect.width > 0 || rect.height > 0) {
        setInputPosition({
          top: rect.bottom + 4,
          left: rect.left,
        });
      } else {
        // Fallback: position near the click event or center of viewport
        setInputPosition({
          top: 200,
          left: 100,
        });
      }
    } else {
      // Fallback position if no selection
      setInputPosition({
        top: 200,
        left: 100,
      });
    }
    setLinkUrl(currentUrl);
    setIsEditing(true);
  };

  const handleSubmit = () => {
    if (linkUrl) {
      updateLink({ href: linkUrl });
    }
    setIsEditing(false);
    setInputPosition(null);
    focus();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputPosition(null);
    focus();
  };

  return (
    <>
      <FloatingToolbar
        items={[
          {
            type: ComponentItem.ToolbarGroup,
            label: "Simple Formatting",
            items: [
              {
                type: ComponentItem.ToolbarCommandButton,
                commandName: "toggleHeading",
                display: "icon",
                attrs: { level: 1 },
              },
              {
                type: ComponentItem.ToolbarCommandButton,
                commandName: "toggleHeading",
                display: "icon",
                attrs: { level: 2 },
              },
            ],
          },
        ]}
        positioner="emptyBlockStart"
      />

      {/* Link button - always mounted, hidden when editing */}
      <FloatingWrapper
        positioner="selection"
        placement="top-end"
        enabled={!empty && !isEditing}
        containerClass="shadow rounded overflow-hidden"
      >
        <button
          type="button"
          className="bg-gray-100 p-2"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Chain button clicked");
            handleStartEditing();
          }}
        >
          <ChainIcon className="h-4 w-4" />
        </button>
        {activeLink && (
          <button
            type="button"
            className="bg-gray-100 p-2 border-l-2"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={() => {
              removeLink();
            }}
          >
            <DeleteIcon className="h-4 w-4" />
          </button>
        )}
      </FloatingWrapper>

      {/* Link input - rendered via portal to avoid clipping */}
      {isEditing &&
        inputPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: inputPosition.top,
              left: inputPosition.left,
              zIndex: 9999,
            }}
            className="shadow-lg rounded overflow-hidden bg-white"
          >
            <input
              ref={inputRef}
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="block w-64 px-2 py-2 text-xs focus:outline-none transition-colors ease-in-out duration-200 bg-gray-100 border-2 rounded"
              placeholder="Enter link URL..."
              onBlur={() => {
                // Small delay to allow click events to fire first
                setTimeout(() => {
                  handleCancel();
                }, 150);
              }}
              onKeyDown={(event) => {
                const { key } = event;
                if (key === "Enter") {
                  event.preventDefault();
                  handleSubmit();
                }
                if (key === "Escape") {
                  handleCancel();
                }
              }}
            />
          </div>,
          document.body
        )}
    </>
  );
};

export default AddEditLink;
