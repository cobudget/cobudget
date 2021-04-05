import { CheckIcon } from "components/Icons";

const todos = [
  {
    done: true,
    title: "Create community",
    desc:
      "This is your own home on the Plato platform, now available under not-here.platoproject.org",
    link: "potato.com",
  },
  {
    done: false,
    title: "Invite members",
    desc: "Invite your community members by email",
    link: "/org/settings?tab=members",
  },
  {
    done: false,
    title: "Create first event",
    desc: "An event is a page for gathering ideas from the community.",
    link: "/create-event",
  },
];

const TodoList = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md">
      <h1 className="text-2xl font-semibold mb-4 text-center">
        {"👌 Let's get this ball rolling!"}
      </h1>
      <div className="flex flex-col space-y-3">
        {todos.map((todo, index) => (
          <div
            key={index}
            className={`flex space-x-2 ${todo.done ? "opacity-60" : ""}`}
          >
            <div className="flex-none rounded-full p-1 mt-1.5 mx-2 h-7 w-7 bg-gray-100 flex items-center justify-center">
              {todo.done ? <CheckIcon /> : index + 1}
            </div>
            <div>
              <div className="text-lg">{todo.title}</div>
              <div className="text-sm text-gray-700">{todo.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;
