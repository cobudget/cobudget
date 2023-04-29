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
  useCommands,
  useKeymap,
  useActive,
} from "@remirror/react";
import { AllStyledComponent } from "@remirror/styles/emotion";
import { debounce } from "lodash";
import styled from "styled-components";
import { useQuery, gql } from "urql";
import { namedColorToHsl, namedColorWithAlpha } from "utils/colors";
import { appLink } from "utils/internalLinks";
import uploadImageFiles from "utils/uploadImageFiles";
import HappySpinner from "./HappySpinner";
import { FormattedMessage, useIntl } from "react-intl";
import parseMDSource from "utils/parseMDSource";

const USER_LINK_START = appLink("/user/");

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

  /* to avoid the mention popup ending up under other elements
     https://github.com/remirror/remirror/issues/1511 */
  .remirror-floating-popover {
    z-index: 10;
  }
`;

const SEARCH_MENTION_MEMBERS_QUERY = gql`
  query SearchMentionMembers($roundId: ID!, $search: String!) {
    membersPage(roundId: $roundId, isApproved: true, search: $search) {
      members(roundId: $roundId, isApproved: true, search: $search) {
        id
        user {
          id
          username
        }
      }
    }
  }
`;

export const SEARCH_MENTIONS_GROUP_MEMBERS_QUERY = gql`
  query SearchMentionMembers($groupId: ID!, $search: String!) {
    groupMembersPage(groupId: $groupId, isApproved: true, search: $search) {
      groupMembers {
        id
        email
        user {
          id
          username
          email
        }
      }
    }
  }
`;

const HardBreak = () => {
  const commands = useCommands();
  const active = useActive(false);

  useKeymap("Enter", ({ next }) => {
    // If following extensions are active, hard break is not required
    // 1. bulletList
    // 2. orderedList
    // 3. codeBlock
    if (active.bulletList() || active.orderedList() || active.codeBlock()) {
      return next();
    }

    //deactivate these extensions on enter press if they are active
    const extensionsWithToggle = {
      bold: commands.toggleBold,
      italic: commands.toggleItalic,
      strike: commands.toggleStrike,
      code: commands.toggleCode,
    };

    for (const x in extensionsWithToggle) {
      if (active[x]()) {
        extensionsWithToggle[x]();
      }
    }

    commands.insertHardBreak();
    return true;
  });
  return null;
};

function MentionComponent({ roundId, groupId }) {
  const [mentionState, setMentionState] = useState<MentionAtomState | null>();

  const searchString = mentionState?.query.full.toLowerCase() ?? "";
  const tooShortSearch = !searchString || searchString.length < 2;

  const [{ fetching, data }, searchMembers] = useQuery({
    query: roundId
      ? SEARCH_MENTION_MEMBERS_QUERY
      : SEARCH_MENTIONS_GROUP_MEMBERS_QUERY,
    variables: {
      roundId,
      groupId,
      search: searchString,
    },
    pause: true,
  });

  const debouncedSearchMembers = useMemo(() => {
    return debounce(searchMembers, 300, { leading: true });
  }, [searchMembers]);

  const items: MentionAtomNodeAttributes[] = useMemo(() => {
    if (fetching || !data || tooShortSearch) {
      return [];
    }

    const members =
      (roundId
        ? data.membersPage?.members
        : data.groupMembersPage?.groupMembers) || [];

    return members.map(
      (member): MentionAtomNodeAttributes => {
        const userLink = appLink(
          `/user/${member.user.id}#${member.user.email}`
        );
        return {
          id: userLink,
          label: `@${member.user.username}`,
          href: userLink,
        };
      }
    );
  }, [data, fetching, tooShortSearch, roundId]);

  useEffect(() => {
    if (tooShortSearch) return;

    debouncedSearchMembers();
  }, [tooShortSearch, debouncedSearchMembers]);

  return (
    <MentionAtomPopupComponent
      onChange={setMentionState}
      items={items}
      ZeroItemsComponent={() =>
        fetching ? (
          <HappySpinner className="m-3" />
        ) : tooShortSearch ? (
          <div className="text-gray-700 m-3">
            <FormattedMessage defaultMessage="Type to search for a user" />
          </div>
        ) : (
          <div className="text-gray-700 m-3">
            <FormattedMessage defaultMessage="No user found" />
          </div>
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
    cloudinaryPreset: "dreams", //TODO: get new preset
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
    markSpec.parseDOM[0].tag = `a[href]:not([href^="${USER_LINK_START}"])`;

    return markSpec;
  }
}

const Wysiwyg = ({
  inputRef = null,
  placeholder = "",
  autoFocus = false,
  defaultValue = "",
  rows = 2,
  onChange,
  highlightColor,
  enableMentions = false,
  mentionsCollId = null,
  mentionsGroupId = null,
  showWysiwygOptions = true,
}) => {
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
                    tag: `a[href][href^="${USER_LINK_START}"]`,
                    getAttrs: (node: string | Node) => {
                      if (!isElementDomNode(node)) {
                        return false;
                      }

                      const href = node.getAttribute("href");
                      const label = node.textContent;
                      return {
                        id: href,
                        name: "at",
                        label,
                        href,
                      };
                    },
                  },
                ],
              },
              extraAttributes: {
                name: { default: "at" },
                href: { default: "" },
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
    [placeholder, enableMentions]
  );

  const { manager, getContext } = useRemirror({
    extensions,
    stringHandler: "markdown",
  });

  // function mostly copied from this link (MIT) because that one is private
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

    const _filePicker = filePicker.current;
    filePicker.current.addEventListener("change", detectFileUpload);

    return () => _filePicker?.removeEventListener("change", detectFileUpload);
  }, [filePicker, fileUploadFileHandler]);
  const intl = useIntl();

  const toolbarItems = useCallback(
    (): ToolbarItemUnion[] => [
      {
        type: ComponentItem.ToolbarGroup,
        label: intl.formatMessage({ defaultMessage: "Simple Formatting" }),
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
        label: intl.formatMessage({ defaultMessage: "Heading Formatting" }),
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
        label: intl.formatMessage({ defaultMessage: "Simple Formatting" }),
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
        label: intl.formatMessage({ defaultMessage: "Lists" }),
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
        label: intl.formatMessage({ defaultMessage: "History" }),
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
    [intl]
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
              onChange?.({
                target: {
                  value: param.helpers.getMarkdown(),
                },
              });
            }, 250)}
          >
            <ImperativeHandle ref={inputRef} />
            {showWysiwygOptions && (
              <div className="overflow-auto">
                <Toolbar
                  items={toolbarItems()}
                  refocusEditor
                  label={intl.formatMessage({ defaultMessage: "Top Toolbar" })}
                />
              </div>
            )}
            <EditorComponent />
            {enableMentions && (
              <MentionComponent
                roundId={mentionsCollId}
                groupId={mentionsGroupId}
              />
            )}
          </Remirror>
        </EditorCss>
      </ThemeProvider>
    </AllStyledComponent>
  );
};

export default Wysiwyg;
