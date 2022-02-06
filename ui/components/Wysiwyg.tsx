// a lot of this file is copied (MIT) from
// https://github.com/remirror/remirror/blob/cb0829780d22774d6bddbc037e5b16f6e1422d82/packages/remirror__react-editors/src/markdown/markdown-editor.tsx

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DelayedPromiseCreator,
  isElementDomNode,
  ExtensionPriority,
  ApplySchemaAttributes,
  MarkSpecOverride,
  MarkExtensionSpec,
} from "@remirror/core";
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
  ImageExtension,
  ListItemExtension,
  MarkdownExtension,
  MentionAtomExtension,
  MentionAtomNodeAttributes,
  OrderedListExtension,
  //TaskListExtension,
  //TaskListItemExtension,
  PlaceholderExtension,
  StrikeExtension,
  //TableExtension,
  TrailingNodeExtension,
  ImageAttributes,
} from "remirror/extensions";
// switch to this one for react tables
//import { TableExtension } from "@remirror/extension-react-tables";
import {
  ComponentItem,
  EditorComponent,
  MentionAtomPopupComponent,
  MentionAtomState,
  Remirror,
  //ReactComponentExtension,
  ThemeProvider,
  Toolbar,
  ToolbarItemUnion,
  useRemirror,
  useRemirrorContext,
} from "@remirror/react";
import { AllStyledComponent } from "@remirror/styles/emotion";
import { debounce } from "lodash";
import styled from "styled-components";
import { useQuery, gql } from "urql";
import { namedColorToHsl, namedColorWithAlpha } from "utils/colors";
import uploadImageFiles from "utils/uploadImageFiles";
import HappySpinner from "./HappySpinner";

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

  /* make hyperlinks not look like plaintext */
  a {
    text-decoration: underline;
  }

  /* correct color on outline and toolbar buttons */
  ${({ highlightColor }) =>
    highlightColor
      ? `--rmr-color-outline: ${namedColorWithAlpha(
          highlightColor,
          "100%"
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

const SEARCH_MENTION_MEMBERS_QUERY = gql`
  query SearchMentionMembers($collectionId: ID!, $usernameStartsWith: String!) {
    members(
      collectionId: $collectionId
      isApproved: true
      usernameStartsWith: $usernameStartsWith
    ) {
      id
      user {
        id
        username
      }
    }
  }
`;

function MentionComponent({ collectionId }) {
  const [users, setUsers] = useState<MentionAtomNodeAttributes[]>([]);
  const [mentionState, setMentionState] = useState<MentionAtomState | null>();

  const searchString = mentionState?.query.full.toLowerCase() ?? "";

  const [{ fetching, data }, searchMembers] = useQuery({
    query: SEARCH_MENTION_MEMBERS_QUERY,
    variables: {
      collectionId,
      usernameStartsWith: searchString,
    },
    pause: true,
  });

  const items = useMemo(() => {
    if (!mentionState) {
      return [];
    }

    const allItems = users;

    if (!allItems) {
      return [];
    }

    return allItems
      .filter((item) => item.label.toLowerCase().includes(searchString))
      .sort();
  }, [mentionState, users]);

  console.log("members results", data?.members);

  // TODO: skapa `users` genom att bara map'a `members` till rätt form. behöver nog ingen useeffect till just det.

  useEffect(() => {
    if (!searchString) return;

    // TODO: only search if there's at least 2 characters
    searchMembers();

    setTimeout(() => {
      console.log("setting users");
      setUsers([
        // TODO: add domain to href (should vary on dev/prod, refactor appLink from email service) so it also works in emails and discourse
        { id: "joe", label: "@Joe", href: "/user/1234" },
        { id: "sue", label: "@Sue", href: "/user/1235" },
        { id: "pat", label: "@Pat", href: "/user/1236" },
        { id: "tom", label: "@Tom", href: "/user/1237" },
        { id: "jim", label: "@Jim", href: "/user/1238" },
      ]);
    }, 5000);
  }, [setUsers, searchString]);

  return (
    <MentionAtomPopupComponent
      onChange={setMentionState}
      items={items}
      ZeroItemsComponent={() =>
        fetching ? (
          <HappySpinner className="m-3" />
        ) : (
          <div className="text-gray-700">No user found</div>
        )
      }
    />
  );
}

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

type SetProgress = (progress: number) => void;

interface FileWithProgress {
  file: File;
  progress: SetProgress;
}

type DelayedImage = DelayedPromiseCreator<ImageAttributes>;

// glue function that connects the remirror image embed logic with our
// image upload function
const imageUploadHandler = (
  filesWithProgress: FileWithProgress[]
): DelayedImage[] => {
  const files = filesWithProgress.map((fwp) => fwp.file);

  const setProgression = filesWithProgress
    .map((fwp) => fwp.progress)
    .map((setProgress) => (isUploading: boolean) =>
      // timeout needed because a variable in the lib isn't init'ed yet
      // see `uploads` here
      // https://github.com/remirror/remirror/blob/3d62a9b937e48169fbe8c13871f882bfac74832f/packages/remirror__extension-image/src/image-extension.ts#L209-L214
      setTimeout(() => setProgress(isUploading ? 0.4 : 1.0), 0)
    );

  return uploadImageFiles({
    files,
    setUploadingImages: setProgression,
    cloudinaryPreset: "organization_logos", //TODO: get new preset
  }).map((imgPromise) => () =>
    imgPromise.then(
      (imgUrl: string): ImageAttributes => {
        return { src: imgUrl };
      }
    )
  );
};

class MyLinkExtension extends LinkExtension {
  createMarkSpec(
    extra: ApplySchemaAttributes,
    override: MarkSpecOverride
  ): MarkExtensionSpec {
    const markSpec = super.createMarkSpec(extra, override);

    // we want to select links except for when they're links to a user page (i.e. when it's a mention)
    // TODO: does this include `a` tags without hrefs? we want to avoid that
    markSpec.parseDOM[0].tag = `a:not([href^="/user/"])`;

    return markSpec;
  }
}

const Wysiwyg = ({
  inputRef,
  placeholder,
  autoFocus,
  defaultValue,
  rows = 2,
  onChange,
  highlightColor,
  enableMentions = false,
  mentionsCollId = null,
}) => {
  console.log("mentionscollid", mentionsCollId);

  const extensions = useCallback(
    () => [
      new PlaceholderExtension({ placeholder }),
      new BoldExtension({}),
      new StrikeExtension(),
      new ItalicExtension(),
      new HeadingExtension({}),
      ...(enableMentions
        ? [
            new MentionAtomExtension({
              mentionTag: "a",
              nodeOverride: {
                parseDOM: [
                  {
                    tag: `a[href^="/user/"]`,
                    getAttrs: (node: string | Node) => {
                      if (!isElementDomNode(node)) {
                        return false;
                      }

                      console.log("nodeOverride parseDOM getAttrs", node);

                      const id = "id";
                      const name = "name";
                      const href = node.getAttribute("href");
                      const label = node.textContent;
                      return {
                        id,
                        name,
                        label,
                        href,
                      };
                    },
                  },
                ],
              },
              extraAttributes: {
                id: {
                  default: "1",
                  parseDOM: (dom) => {
                    return dom.getAttribute("href");
                  },
                  toDOM: (attrs) => {
                    return ["data-id", "asdf"];
                  },
                },
                userId: {
                  default: 0,
                },
                href: {
                  default: "potato",
                },
              },
              matchers: [{ name: "at", char: "@", appendText: " " }],
            }),
          ]
        : []),
      enableMentions
        ? new MyLinkExtension({ autoLink: true })
        : new LinkExtension({ autoLink: true }),
      new ImageExtension({
        enableResizing: false,
        uploadHandler: imageUploadHandler,
      }),
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

  const { manager, getContext } = useRemirror({
    extensions,
    stringHandler: "markdown",
  });

  // function mostly copied from this link because that one is private
  // https://github.com/remirror/remirror/blob/3d62a9b937e48169fbe8c13871f882bfac74832f/packages/remirror__extension-image/src/image-extension.ts#L205-L223
  const fileUploadFileHandler = useCallback(
    (files: File[]) => {
      const { commands, chain } = getContext();
      const filesWithProgress: FileWithProgress[] = files.map(
        (file, index) => ({
          file,
          progress: (progress) => {
            commands.updatePlaceholder(uploads[index], progress);
          },
        })
      );

      const uploads = imageUploadHandler(filesWithProgress);

      for (const upload of uploads) {
        chain.uploadImage(upload);
      }

      chain.run();

      return true;
    },
    [getContext]
  );

  const filePicker = useRef<HTMLInputElement>();

  useEffect(() => {
    // detects the user picking new images after clicking the image embed button
    // in the editor toolbar, and sends them to the image upload and embed functions
    const detectFileUpload = () => {
      fileUploadFileHandler(Array.from(filePicker.current.files));
    };

    filePicker.current.addEventListener("change", detectFileUpload);

    return () =>
      filePicker.current?.removeEventListener("change", detectFileUpload);
  }, [filePicker]);

  const toolbarItems = useCallback(
    (): ToolbarItemUnion[] => [
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
      // {
      //   type: ComponentItem.ToolbarGroup,
      //   label: "Embed",
      //   items: [
      //     {
      //       type: ComponentItem.ToolbarButton,
      //       onClick: () => {
      //         filePicker.current.click();
      //       },
      //       icon: "imageAddLine",
      //     },
      //   ],
      //   separator: "end",
      // },
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
    ],
    [filePicker]
  );

  return (
    <AllStyledComponent>
      <ThemeProvider>
        <EditorCss highlightColor={highlightColor} rows={rows}>
          <input
            className="filepicker"
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            ref={filePicker}
          />
          <Remirror
            manager={manager}
            autoFocus={autoFocus}
            initialContent={defaultValue}
            onChange={debounce((param) => {
              console.log("md", param.helpers.getMarkdown());
              onChange?.({
                target: {
                  value: param.helpers.getMarkdown(),
                },
              });
            }, 250)}
          >
            <ImperativeHandle ref={inputRef} />
            <div className="overflow-auto">
              <Toolbar
                items={toolbarItems()}
                refocusEditor
                label="Top Toolbar"
              />
            </div>
            <EditorComponent />
            {enableMentions && (
              <MentionComponent collectionId={mentionsCollId} />
            )}
          </Remirror>
        </EditorCss>
      </ThemeProvider>
    </AllStyledComponent>
  );
};

export default Wysiwyg;
