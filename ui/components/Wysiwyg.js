// this file is largely copied (MIT) from
// https://github.com/remirror/remirror/blob/cb0829780d22774d6bddbc037e5b16f6e1422d82/packages/remirror__react-editors/src/markdown/markdown-editor.tsx
// due to
// https://github.com/remirror/remirror/issues/1349
// and because we want to customize it

import { forwardRef, useCallback, useImperativeHandle } from "react";
import { ExtensionPriority } from "remirror";
import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeBlockExtension,
  CodeExtension,
  HardBreakExtension,
  HeadingExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  MarkdownExtension,
  OrderedListExtension,
  //TaskListExtension,
  //TaskListItemExtension,
  PlaceholderExtension,
  StrikeExtension,
  //TableExtension,
  TrailingNodeExtension,
} from "remirror/extensions";
// switch to this one for react tables
//import { TableExtension } from "@remirror/extension-react-tables";
import {
  ComponentItem,
  EditorComponent,
  Remirror,
  //ReactComponentExtension,
  ThemeProvider,
  Toolbar,
  useRemirror,
  useRemirrorContext,
} from "@remirror/react";
import { AllStyledComponent } from "@remirror/styles/emotion";
import { debounce } from "lodash";
import styled from "styled-components";
import { namedColorToHsl, namedColorWithAlpha } from "utils/colors";

const EditorCss = styled.div`
  /* to make lists render correctly in the editor (they're missing the
     dots/numbers for some reason) */
  .remirror-editor ul li.remirror-list-item-with-custom-mark {
    margin-left: 1.2em !important;
    list-style: disc !important;
  }

  .remirror-editor ol li.remirror-list-item-with-custom-mark {
    margin-left: 1.5em !important;
    list-style: num !important;
  }

  .remirror-editor .remirror-list-item-marker-container {
    display: none !important;
  }

  /* correct color on outline and toolbar buttons */
  ${({ highlightColor }) =>
    highlightColor
      ? `--rmr-color-outline: ${namedColorWithAlpha(
          highlightColor,
          "40%"
        )} !important;
        --rmr-color-primary: ${namedColorToHsl(highlightColor)} !important;
        --rmr-color-hover-primary: ${namedColorToHsl(
          highlightColor
        )} !important;`
      : ""}

  /* editor height */
  .ProseMirror {
    min-height: ${({ rows }) => `${rows * 2.5}em !important`};
  }
`;

const ImperativeHandle = forwardRef((props, ref) => {
  const { commands, clearContent } = useRemirrorContext({
    autoUpdate: true,
  });

  useImperativeHandle(ref, () => ({
    blur: commands.blur,
    clear: () => clearContent({ triggerChange: true }),
  }));

  return <></>;
});

/**
 * The editor which is used to create the annotation. Supports formatting.
 */
const Wysiwyg = ({
  inputRef,
  placeholder,
  autoFocus,
  defaultValue,
  rows = 2,
  onChange,
  highlightColor,
}) => {
  const extensions = useCallback(
    () => [
      new PlaceholderExtension({ placeholder }),
      new LinkExtension({ autoLink: true }),
      new BoldExtension(),
      new StrikeExtension(),
      new ItalicExtension(),
      new HeadingExtension(),
      new LinkExtension(),
      new BlockquoteExtension(),
      new BulletListExtension({ enableSpine: true }),
      new OrderedListExtension(),
      new ListItemExtension({
        priority: ExtensionPriority.High,
        enableCollapsible: true,
      }),
      //new TaskListExtension(),
      // TODO: unclear if needed
      // what's with the css?
      //new TaskListItemExtension(),
      new CodeExtension(),
      new CodeBlockExtension({ supportedLanguages: [] }),
      new TrailingNodeExtension(),
      // for react tables
      //new ReactComponentExtension(),
      //new TableExtension(),
      new MarkdownExtension({ copyAsMarkdown: false }),
      /**
       * `HardBreakExtension` allows us to create a newline inside paragraphs.
       * e.g. in a list item
       */
      new HardBreakExtension(),
    ],
    [placeholder]
  );

  const { manager } = useRemirror({
    extensions,
    stringHandler: "markdown",
  });

  return (
    <AllStyledComponent>
      <ThemeProvider>
        <EditorCss highlightColor={highlightColor} rows={rows}>
          <Remirror
            manager={manager}
            autoFocus={autoFocus}
            initialContent={defaultValue}
            onChange={debounce((param) => {
              onChange?.({
                target: {
                  value: param.helpers.getMarkdown(),
                },
              });
            }, 250)}
          >
            <ImperativeHandle ref={inputRef} />
            <div className="overflow-auto">
              <Toolbar items={toolbarItems} refocusEditor label="Top Toolbar" />
            </div>
            <EditorComponent />
          </Remirror>
        </EditorCss>
      </ThemeProvider>
    </AllStyledComponent>
  );
};

const toolbarItems = [
  {
    type: ComponentItem.ToolbarGroup,
    label: "Simple Formatting",
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleBold",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleItalic",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleStrike",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleCode",
        display: "icon",
      },
    ],
    separator: "end",
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: "Heading Formatting",
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
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleHeading",
        display: "icon",
        attrs: { level: 3 },
      },
    ],
    separator: "end",
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: "Simple Formatting",
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleBlockquote",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleCodeBlock",
        display: "icon",
      },
    ],
    separator: "end",
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: "Lists",
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleBulletList",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleOrderedList",
        display: "icon",
      },
      // task lists don't work with md yet
      // https://github.com/remirror/remirror/issues/1357
      //{
      //  type: ComponentItem.ToolbarCommandButton,
      //  commandName: "toggleTaskList",
      //  display: "icon",
      //},
      // tables are a bit buggy so far
      // https://github.com/remirror/remirror/issues/1356
      //{
      //  type: ComponentItem.ToolbarCommandButton,
      //  commandName: "createTable",
      //  display: "icon",
      //},
    ],
    separator: "end",
  },
  {
    type: ComponentItem.ToolbarGroup,
    label: "History",
    items: [
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "undo",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "redo",
        display: "icon",
      },
    ],
    separator: "none",
  },
];

export default Wysiwyg;
