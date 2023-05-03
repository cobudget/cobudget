import {
  useActive,
  useCommands,
  useCurrentSelection,
  useAttrs,
  FloatingToolbar,
  FloatingWrapper,
  ComponentItem,
} from "@remirror/react";

import {
  ChangeEvent,
  HTMLProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createMarkPositioner } from "remirror/extensions";

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
          className="ml-2"
          onClick={() => setIsEditing(true)}
        >
          Add Link
        </button>
        <button
          type="button"
          className="ml-2"
          onClick={() => setIsEditing(true)}
        >
          Remove Link
        </button>
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
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            console.log(event.target.value)
          }
          value={"http://google.com"}
          onKeyPress={(event) => {
            event.preventDefault();
            const { code } = event;

            if (code === "Enter") {
              setIsEditing(false);
              alert("Update");
            }

            if (code === "Escape") {
              alert("remove");
            }
          }}
        />
      </FloatingWrapper>
    </>
  );
};

function LinkButton() {
  const active = useActive();
  const { focus, updateLink, removeLink } = useCommands();
  const url = (useAttrs().link()?.href as string) ?? "";

  return active ? (
    <>
      <button
        onClick={() => {
          const href = window.prompt("Enter url", url);
          updateLink({ href });
          focus();
        }}
        type="button"
      >
        Add
      </button>
      <button
        onClick={() => {
          removeLink();
          focus();
        }}
        type="button"
      >
        Remove
      </button>
    </>
  ) : (
    <p>ABC</p>
  );
}

export default AddEditLink;
