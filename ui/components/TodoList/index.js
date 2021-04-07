import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Link from "next/link";
import { CheckIcon } from "components/Icons";
import HappySpinner from "components/HappySpinner";
import NavItem from "components/Header/NavItem";

const rawTodos = [
  {
    title: "Create community",
    desc:
      "This is your own home on the Plato platform, now available under not-here.platoproject.org",
    link: null,
  },
  {
    title: "Invite members",
    desc: "Invite your community members by email",
    link: "/org/settings?tab=members",
  },
  {
    title: "Create first event",
    desc: "An event is a page for gathering ideas from the community.",
    link: "/create-event",
  },
];

const GET_TODO_INFO = gql`
  query TodoInfo {
    orgMembers(limit: 2) {
      id
    }

    events(limit: 1) {
      id
    }
  }
`;

const SET_TODOS_FINISHED = gql`
  mutation SetTodosFinished {
    setTodosFinished {
      id
      finishedTodos
    }
  }
`;

const TodoItem = React.forwardRef(({ onClick, href, todo, index }, ref) => {
  return (
    <a
      className={`flex space-x-2 ${
        todo.link ? "hover:bg-gray-300 cursor-pointer" : ""
      } ${todo.done ? "opacity-60" : ""}`}
      onClick={onClick}
      href={href}
      ref={ref}
    >
      <div className="flex-none rounded-full p-1 mt-1.5 mx-2 h-7 w-7 bg-gray-100 flex items-center justify-center">
        {todo.done ? <CheckIcon /> : index + 1}
      </div>
      <div>
        <div className="text-lg">{todo.title}</div>
        <div className="text-sm text-gray-700">{todo.desc}</div>
      </div>
    </a>
  );
});

const TodoList = () => {
  const { data, loading, error } = useQuery(GET_TODO_INFO);
  const [setTodosFinished] = useMutation(SET_TODOS_FINISHED);

  if (error) {
    console.error("Couldn't check todo status", error);
    return null;
  }
  if (loading) return <HappySpinner />;

  console.log({ data });
  const todos = rawTodos.map((todo, index) => {
    let done = false;

    if (index === 0) {
      done = true;
    } else if (index === 1) {
      done = data.orgMembers.length > 1;
    } else if (index === 2) {
      done = data.events.length > 0;
    }

    return {
      ...todo,
      done,
    };
  });

  // TODO: when this is true, send a mutation that hides the todolist
  const allDone = todos.every((todo) => todo.done);
  console.log("alldone", allDone);

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md">
      <h1 className="text-2xl font-semibold mb-4 text-center">
        {"👌 Let's get this ball rolling!"}
      </h1>
      <div className="flex flex-col space-y-3">
        {todos.map((todo, index) =>
          todo.link ? (
            <Link key={index} href={todo.link}>
              <TodoItem todo={todo} index={index} />
            </Link>
          ) : (
            <TodoItem key={index} todo={todo} index={index} />
          )
        )}
      </div>
      <div className="mt-4">
        <NavItem
          onClick={() =>
            window.confirm("Are you sure you want skip this introduction?") &&
            setTodosFinished()
          }
          className="text-xs opacity-70 ml-auto"
        >
          Hide intro
        </NavItem>
      </div>
    </div>
  );
};

export default TodoList;
