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
      <div>progress bar here</div>
      <div>
        {todos.map((todo, index) => (
          <div key={index}>
            <div>{todo.title}</div>
            <div>{todo.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;
