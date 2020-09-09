import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { CloseIcon, ArrowUpIcon } from "components/Icons";
import TextField from "components/TextField";
import ExpandButton from "components/ExpandButton";

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
        <ReactMarkdown
          source={guideline.description}
          className="markdown text-sm "
        />
      </div>

      <ExpandButton expanded={expanded} setExpanded={setExpanded} />
    </div>
  );
};

const InputAction = ({ item, setChatItems, chatItems, color }) => {
  const [input, setInput] = useState("");
  const disabled = input.length === 0;
  return (
    <div className="mt-2 flex items-center min-w-full">
      <TextField
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

const Monster = ({ event }) => {
  const [open, setOpen] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(true);
  const closeBubble = () => setBubbleOpen(false);

  const guidelines = event.guidelines.map((guideline) => ({
    type: GUIDELINE,
    guideline,
  }));

  const [chatItems, setChatItems] = useState([
    ...[
      { type: MESSAGE, message: "Argh! Please help me review this dream!" },
      {
        type: MESSAGE,
        message: "Here are the guidelines that dreams need to follow:",
      },
    ],
    ...guidelines,
    ...[
      {
        type: ACTION,
        message: "Does this dream comply with the guidelines?",
        actions: [
          {
            label: "Yes, looks good to me!",
            sideEffect: () => console.log("calling FLAG api, looks good"),
            chatItems: [{ type: MESSAGE, message: "Alright, thank you!" }],
          },
          {
            label: "No, it's breaking a guideline",
            chatItems: [
              {
                type: ACTION,
                message: "Which one?",
                actions: event.guidelines.map((guideline) => ({
                  label: guideline.title,
                  sideEffect: () => console.log("API choosing guideline"),
                  chatItems: [
                    {
                      type: INPUT,
                      message:
                        "Please provide a reason, why do you think this guideline is not met? Your answer will be anonymous to the dream creators.",
                      sideEffect: (answer) =>
                        console.log(
                          "Flag: ",
                          answer,
                          " for guideline: ",
                          guideline.title
                        ),
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
            ],
          },
        ],
      },
    ],
  ]);

  const renderChatItem = (item, i) => {
    switch (item.type) {
      case MESSAGE:
        return (
          <div
            className="text-gray-800 bg-white shadow p-3 mb-2 rounded"
            key={i}
          >
            {item.message}
          </div>
        );
      case GUIDELINE:
        return (
          <div
            className="text-gray-800 bg-white shadow p-3 mb-2 rounded"
            key={i}
          >
            <GuidelineComponent guideline={item.guideline} />
          </div>
        );
      case ACTION:
        return (
          <div
            className="text-gray-800 bg-white shadow p-3 mb-2 rounded"
            key={i}
          >
            {item.message}
          </div>
        );
      case INPUT:
        return (
          <div
            className="text-gray-800 bg-white shadow p-3 mb-2 rounded"
            key={i}
          >
            {item.message}
          </div>
        );
      case ANSWER:
        return (
          <div
            className={`self-end mt-1 mb-2 rounded-full bg-${event.color} font-semibold py-2 px-3 rounded-full text-white`}
            key={i}
          >
            {item.message}
          </div>
        );
    }
  };
  return (
    <div
      className={
        "fixed right-0 bottom-0 p-4 z-30 flex flex-col items-end max-w-6xl"
      }
    >
      {open && (
        <div
          className={`bg-gray-100 rounded-lg shadow-lg border-${event.color} overflow-hidden border-3 w-100`}
        >
          <div
            className={`bg-${event.color} text-lg text-white p-3 font-semibold flex items-center justify-center relative`}
          >
            <div className="">Review Monster</div>
            <button
              className="absolute mr-2 right-0 focus:outline-none"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
          <div className="p-4 flex flex-col items-start overflow-y-scroll h-148">
            {chatItems.map((item, i) => renderChatItem(item, i))}

            {chatItems[chatItems.length - 1].actions && (
              <div className="flex min-w-full justify-end flex-wrap -mx-1">
                {chatItems[chatItems.length - 1].actions.map((action) => (
                  <button
                    className={`bg-${event.color} m-1 hover:bg-${event.color}-darker font-semibold py-2 px-3 rounded-full text-white focus:outline-none`}
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

            {chatItems[chatItems.length - 1].type === INPUT && (
              <InputAction
                item={chatItems[chatItems.length - 1]}
                chatItems={chatItems}
                setChatItems={setChatItems}
                color={event.color}
              />
            )}
          </div>
        </div>
      )}

      {bubbleOpen && !open && (
        <>
          <div
            className="relative bg-white text-gray-800 w-64 cursor-pointer rounded-lg p-4 shadow-lg mb-2 animation-once animation-fade-in"
            onClick={() => {
              setOpen(true);
              closeBubble();
            }}
          >
            {chatItems[0].message}
            <button
              className="absolute p-1 m-1 top-0 right-0 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                closeBubble();
              }}
              tabIndex="-1"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </>
      )}

      {!open && (
        <img
          onClick={() => {
            closeBubble();
            setOpen(!open);
          }}
          className="w-40 cursor-pointer animate-wiggle hover:animate-none"
          src="/calm-monster.gif"
        />
      )}
    </div>
  );
};

export default Monster;
