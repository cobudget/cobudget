// this file is largely copied (MIT) from
// https://github.com/remirror/remirror/blob/cb0829780d22774d6bddbc037e5b16f6e1422d82/packages/remirror__react-editors/src/markdown/markdown-editor.tsx
// due to
// https://github.com/remirror/remirror/issues/1349
// and because we want to customize it

//import "@remirror/styles/all.css";

import { useCallback } from "react";
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
  TaskListExtension,
  TaskListItemExtension,
  PlaceholderExtension,
  StrikeExtension,
  TableExtension,
  TrailingNodeExtension,
} from "remirror/extensions";
import {
  ComponentItem,
  EditorComponent,
  Remirror,
  ThemeProvider,
  Toolbar,
  useRemirror,
} from "@remirror/react";
import { AllStyledComponent } from "@remirror/styles/emotion";
import { debounce } from "lodash";

/**
 * The editor which is used to create the annotation. Supports formatting.
 */
const Wysiwyg = ({ placeholder, defaultValue, onChange }) => {
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
      new TaskListExtension(),
      // TODO: unclear if needed
      // what's with the css?
      //new TaskListItemExtension(),
      new CodeExtension(),
      new CodeBlockExtension({ supportedLanguages: [] }),
      new TrailingNodeExtension(),
      new TableExtension(),
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
        <Remirror
          manager={manager}
          autoFocus
          initialContent={defaultValue}
          onChange={debounce((param) => {
            onChange?.({
              target: {
                value: param.helpers.getMarkdown(),
              },
            });
          }, 250)}
        >
          <Toolbar items={toolbarItems} refocusEditor label="Top Toolbar" />
          <EditorComponent />
        </Remirror>
      </ThemeProvider>
    </AllStyledComponent>
  );
};

//const Wysiwyg = () => {
//
//}

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
        type: ComponentItem.ToolbarMenu,

        items: [
          {
            type: ComponentItem.MenuGroup,
            role: "radio",
            items: [
              {
                type: ComponentItem.MenuCommandPane,
                commandName: "toggleHeading",
                attrs: { level: 3 },
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: "toggleHeading",
                attrs: { level: 4 },
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: "toggleHeading",
                attrs: { level: 5 },
              },
              {
                type: ComponentItem.MenuCommandPane,
                commandName: "toggleHeading",
                attrs: { level: 6 },
              },
            ],
          },
        ],
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
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleTaskList",
        display: "icon",
      },
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "createTable",
        display: "icon",
      },
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
      {
        type: ComponentItem.ToolbarCommandButton,
        commandName: "toggleColumns",
        display: "icon",
        attrs: { count: 2 },
      },
    ],
    separator: "none",
  },
];

export default Wysiwyg;
