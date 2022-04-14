import { useEffect, useState } from "react";
import { useMutation, gql } from "urql";

import { CloseIcon, ArrowUpIcon } from "components/Icons";
import TextField from "components/TextField";
import ExpandButton from "components/ExpandButton";
import Markdown from "./Markdown";
import Button from "./Button";

const GUIDELINE = "GUIDELINE";
const MESSAGE = "MESSAGE";
const ACTION = "ACTION";
const ANSWER = "ANSWER";
const INPUT = "INPUT";

const GuidelineComponent = ({ guideline }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative w-full">
      <h2 className="mb-1 font-semibold">{guideline.title}</h2>
      <div
        className={expanded ? "" : "line-clamp-2"}
        style={{ minHeight: "36px" }}
      >
        <Markdown source={guideline.description} className="text-sm" />
      </div>

      <ExpandButton expanded={expanded} setExpanded={setExpanded} />
    </div>
  );
};

const InputAction = ({ item, setChatItems, chatItems, color }) => {
  const [input, setInput] = useState("");
  const disabled = input.length === 0;
  return (
    <div className="my-2 mx-3 flex items-end">
      <TextField
        multiline
        placeholder="Write here..."
        color={color}
        className="flex-grow"
        autoFocus
        inputProps={{ value: input, onChange: (e) => setInput(e.target.value) }}
      />

      <button
        onClick={() => {
          item.sideEffect(input);
          setChatItems([
            ...chatItems,
            { type: ANSWER, message: input },
            ...item.chatItems,
          ]);
        }}
        disabled={disabled}
        className={`bg-${
          disabled ? "gray-200" : color
        } transition-colors duration-75 rounded-full p-2 text-white ml-2`}
      >
        <ArrowUpIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

const RAISE_FLAG_MUTATION = gql`
  mutation RaiseFlag($bucketId: ID!, $guidelineId: ID!, $comment: String!) {
    raiseFlag(
      bucketId: $bucketId
      guidelineId: $guidelineId
      comment: $comment
    ) {
      id
      raisedFlags {
        id
        comment
        guideline {
          id
          title
        }
      }
    }
  }
`;

const RESOLVE_FLAG_MUTATION = gql`
  mutation ResolveFlag($bucketId: ID!, $flagId: ID!, $comment: String!) {
    resolveFlag(bucketId: $bucketId, flagId: $flagId, comment: $comment) {
      id
      raisedFlags {
        id
        comment
        guideline {
          id
          title
        }
      }
    }
  }
`;

const ALL_GOOD_FLAG_MUTATION = gql`
  mutation AllGoodFlag($bucketId: ID!) {
    allGoodFlag(bucketId: $bucketId) {
      id
    }
  }
`;

const raiseFlagFlow = ({ guidelines, raiseFlag, bucketId }) => [
  {
    type: ACTION,
    message: "Which one?",
    actions: guidelines.map((guideline) => ({
      label: guideline.title,
      chatItems: [
        {
          type: INPUT,
          message: `Please provide a reason, why do you think this guideline is not met? Your answer will be anonymous to the ${process.env.BUCKET_NAME_SINGULAR} creators.`,
          sideEffect: (answer) => {
            raiseFlag({
              bucketId,
              guidelineId: guideline.id,
              comment: answer,
            }).then(({ error }) => {
              if (error) throw new Error(error.message);
            });
          },
          chatItems: [
            {
              type: MESSAGE,
              message: "Thank you! Your answer has been recorded.",
            },
          ],
        },
      ],
    })),
  },
];

const resolveFlagFlow = ({ flagId, resolveFlag, bucketId }) => [
  {
    type: INPUT,
    message:
      "You can resolve this flag if you feel the issue has been fixed or if it should not be raised. Please provide a comment: ",
    sideEffect: (answer) => {
      resolveFlag({
        bucketId,
        flagId,
        comment: answer,
      }).then(({ error }) => {
        if (error) throw new Error(error.message);
      });
    },
    chatItems: [
      {
        type: MESSAGE,
        message: "Thank you!",
      },
    ],
  },
];

const Monster = ({ bucket }) => {
  const [open, setOpen] = useState(false);
  const [chatItems, setChatItems] = useState([]);

  const [, raiseFlag] = useMutation(RAISE_FLAG_MUTATION);
  const [, resolveFlag] = useMutation(RESOLVE_FLAG_MUTATION);
  const [, allGoodFlag] = useMutation(ALL_GOOD_FLAG_MUTATION);

  const { raisedFlags } = bucket;

  const guidelineItems = bucket.round.guidelines.map((guideline) => ({
    type: GUIDELINE,
    guideline,
  }));

  useEffect(() => {
    if (chatItems.length === 0) {
      if (raisedFlags.length > 0) {
        setChatItems([
          {
            type: MESSAGE,
            message: `This ${process.env.BUCKET_NAME_SINGULAR} has been flagged for breaking guidelines. Please help review it!`,
          },
          {
            type: MESSAGE,
            message: `Here are the guidelines that ${process.env.BUCKET_NAME_PLURAL} need to follow:`,
          },
          ...guidelineItems,
          ...raisedFlags.map((raisedFlag) => ({
            type: MESSAGE,
            message: `Someone flagged this ${process.env.BUCKET_NAME_SINGULAR} for breaking the "${raisedFlag.guideline.title}" guideline with this comment:

          "${raisedFlag.comment}"`,
          })),
          {
            type: ACTION,
            message: `Could you help review this?`,
            actions: [
              {
                label: "It is breaking another guideline",
                chatItems: raiseFlagFlow({
                  guidelines: bucket.round.guidelines.filter(
                    (guideline) =>
                      !raisedFlags
                        .map((flag) => flag.guideline.id)
                        .includes(guideline.id)
                  ),
                  raiseFlag,
                  bucketId: bucket.id,
                }),
              },
              raisedFlags.length > 1
                ? {
                    label: "I'd like to resolve a flag",
                    chatItems: [
                      {
                        type: ACTION,
                        message: "Which one?",
                        actions: raisedFlags.map((raisedFlag) => ({
                          label: `${raisedFlag.guideline.title}: ${raisedFlag.comment}`,
                          chatItems: resolveFlagFlow({
                            flagId: raisedFlag.id,
                            resolveFlag,
                            bucketId: bucket.id,
                          }),
                        })),
                      },
                    ],
                  }
                : {
                    label: "I'd like to resolve the flag",
                    chatItems: resolveFlagFlow({
                      flagId: raisedFlags[0].id,
                      resolveFlag,
                      bucketId: bucket.id,
                    }),
                  },
            ],
          },
        ]);
      } else {
        setChatItems([
          ...[
            {
              type: MESSAGE,
              message: `Please help review this ${process.env.BUCKET_NAME_SINGULAR}!`,
            },
            {
              type: MESSAGE,
              message: `Here are the guidelines that ${process.env.BUCKET_NAME_PLURAL} need to follow:`,
            },
          ],
          ...guidelineItems,
          ...[
            {
              type: ACTION,
              message: `Does this ${process.env.BUCKET_NAME_SINGULAR} comply with the guidelines?`,
              actions: [
                {
                  label: "Yes, looks good to me!",
                  sideEffect: () =>
                    allGoodFlag({ bucketId: bucket.id }).then(({ error }) => {
                      if (error) throw new Error(error.message);
                    }),
                  chatItems: [
                    { type: MESSAGE, message: "Alright, thank you!" },
                  ],
                },
                {
                  label: "No, it's breaking a guideline",
                  chatItems: raiseFlagFlow({
                    guidelines: bucket.round.guidelines,
                    raiseFlag,
                    bucketId: bucket.id,
                  }),
                },
              ],
            },
          ],
        ]);
      }
    }
  }, [
    allGoodFlag,
    bucket.id,
    chatItems,
    guidelineItems,
    raiseFlag,
    raisedFlags,
    resolveFlag,
    bucket.round.guidelines,
  ]);

  if (!guidelineItems) return null;

  const renderChatItem = (item, i) => {
    switch (item.type) {
      case MESSAGE:
      case ACTION:
      case INPUT:
        return (
          <div className="my-2 mx-3 flex justify-start" key={i}>
            <div className="text-gray-800 bg-white shadow p-3 rounded">
              {item.message}
            </div>
          </div>
        );
      case GUIDELINE:
        return (
          <div
            className="text-gray-800 bg-white shadow p-3 my-2 rounded mx-3"
            key={i}
          >
            <GuidelineComponent guideline={item.guideline} />
          </div>
        );
      case ANSWER:
        return (
          <div className={`mt-1 my-2 mx-3 flex justify-end`} key={i}>
            <div
              className={`rounded-full border-2 border-${bucket.round.color} bg-${bucket.round.color} font-semibold py-2 px-3 text-white`}
              key={i}
            >
              {item.message}
            </div>
          </div>
        );
    }
  };
  return (
    <div
      className={
        (open ? "fixed md:p-4" : "") +
        " right-0 bottom-0 z-30 flex flex-col items-end max-w-6xl"
      }
    >
      {open && (
        <div
          className={`fixed inset-0 sm:relative sm:h-148 sm:w-100 bg-gray-100 sm:rounded-lg shadow-lg border-${bucket.round.color} overflow-hidden border-3 flex flex-col`}
        >
          <div
            className={`bg-${bucket.round.color} text-lg text-white p-3 font-semibold flex items-center justify-center relative`}
          >
            <div className="">Review</div>
            <button
              className="absolute mr-2 right-0 focus:outline-none"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
          <div className="relative h-full">
            <div className="absolute inset-0">
              <div className="h-full overflow-y-scroll">
                {chatItems.map((item, i) => renderChatItem(item, i))}

                {chatItems.length > 0 &&
                  chatItems[chatItems.length - 1].actions && (
                    <div className="flex min-w-full justify-end flex-wrap -mx-1 p-3">
                      {chatItems[chatItems.length - 1].actions.map((action) => (
                        <button
                          className={`border-2 border-${bucket.round.color} m-1 hover:bg-${bucket.round.color} text-${bucket.round.color}-dark hover:text-white font-semibold py-2 px-3 rounded-full focus:outline-none`}
                          key={action.label}
                          onClick={() => {
                            action.sideEffect && action.sideEffect();
                            setChatItems([
                              ...chatItems,
                              { type: ANSWER, message: action.label },
                              ...action.chatItems,
                            ]);
                          }}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                {chatItems.length > 0 &&
                  chatItems[chatItems.length - 1].type === INPUT && (
                    <InputAction
                      item={chatItems[chatItems.length - 1]}
                      chatItems={chatItems}
                      setChatItems={setChatItems}
                      color={bucket.round.color}
                    />
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!open && (
        <>
          <Button
            color={bucket.round.color}
            fullWidth
            className={"flex"}
            onClick={() => {
              setOpen(true);
            }}
          >
            Review
          </Button>
        </>
      )}
    </div>
  );
};

export default Monster;
