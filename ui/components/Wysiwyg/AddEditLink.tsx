import {
  useActive,
  useCommands,
  useCurrentSelection,
  useAttrs,
  FloatingToolbar,
  FloatingWrapper,
  ComponentItem,
} from "@remirror/react";

import { HTMLProps, useEffect, useRef, useState } from "react";

const DelayAutoFocusInput = ({
  autoFocus,
  ...rest
}: HTMLProps<HTMLInputElement>) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [autoFocus]);

  return <input ref={inputRef} {...rest} />;
};

export const AddEditLink = () => {
  const active = useActive();
  const activeLink = active.link();
  const [isEditing, setIsEditing] = useState(false);
  const { empty } = useCurrentSelection();
  const { focus, updateLink, removeLink } = useCommands();
  const currentUrl = (useAttrs().link()?.href as string) ?? "";

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

      <FloatingWrapper
        positioner="always"
        placement="top-end"
        enabled={!isEditing && !empty}
        renderOutsideEditor
      >
        <button
          type="button"
          className="ml-2 bg-gray-100 p-2 rounded"
          onClick={() => setIsEditing(true)}
        >
          Add Link
        </button>
        {activeLink && (
          <button
            type="button"
            className="ml-2 bg-gray-100 p-2 rounded"
            onClick={() => {
              removeLink();
            }}
          >
            Remove Link
          </button>
        )}
      </FloatingWrapper>

      <FloatingWrapper
        positioner="always"
        placement="bottom"
        enabled={isEditing}
        renderOutsideEditor
      >
        <DelayAutoFocusInput
          style={{ zIndex: 20 }}
          autoFocus
          placeholder="Enter link..."
          onBlur={() => {
            setIsEditing(false);
          }}
          defaultValue={currentUrl}
          onKeyPress={(event) => {
            const { code } = event;
            if (code === "Enter") {
              updateLink({ href: event.currentTarget.value });
              setIsEditing(false);
              focus();
            }
            if (code === "Escape") {
              setIsEditing(false);
              focus();
            }
          }}
        />
      </FloatingWrapper>
    </>
  );
};

export default AddEditLink;
