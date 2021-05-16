import { useEffect, useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import Link from "next/link";
import { CheckIcon } from "components/Icons";
import HappySpinner from "components/HappySpinner";
import NavItem from "components/Header/NavItem";
import ProgressBar from "components/ProgressBar";

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

const LoadingBar = ({ ratio }) => {
  return (
    <div className="flex items-center mx-3 space-x-4 mb-6">
      <div className="text-xs text-gray-500">{~~(ratio * 100)}%</div>
      <ProgressBar ratio={ratio} color="anthracit" />
    </div>
  );
};

const TodoItem = React.forwardRef(({ onClick, href, todo, index }, ref) => {
  return (
    <a
      className={`py-2 flex space-x-2 rounded ${
        todo.link ? "hover:bg-gray-300 cursor-pointer" : ""
      } ${todo.done ? "opacity-60" : ""}`}
      onClick={onClick}
      href={href}
      ref={ref}
    >
      <div className="flex-none rounded-full p-1 mt-1 mx-2 h-7 w-7 bg-gray-100 flex items-center justify-center">
        {todo.done ? <CheckIcon /> : index + 1}
      </div>
      <div>
        <div className="text-lg">{todo.title}</div>
        <div className="text-sm text-gray-700">{todo.desc}</div>
      </div>
    </a>
  );
});

const TodoList = ({ subdomain }) => {
  const { data, loading, error } = useQuery(GET_TODO_INFO);
  const [setTodosFinished] = useMutation(SET_TODOS_FINISHED);
  const [allDone, setAllDone] = useState(false);

  const rawTodos = [
    {
      title: "Create community",
      desc: `This is your own home on the Plato platform, now available under ${subdomain}.${process.env.DEPLOY_URL}`,
      link: null,
    },
    {
      title: "Invite members",
      desc: "Invite your community members by email",
      link: "/members",
    },
    {
      title: "Create first collection",
      desc: "A collection is a page for gathering ideas from the community",
      link: "/new-collection",
    },
  ];

  useEffect(() => {
    if (allDone) {
      setTodosFinished();
    }
  }, [allDone, setTodosFinished]);

  if (error) {
    console.error("Couldn't check todo status", error);
    return null;
  }
  if (loading) return <HappySpinner />;

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

  const done = todos.every((todo) => todo.done);
  if (done && !allDone) {
    setAllDone(true);
  }

  const doneRatio = todos.filter((todo) => todo.done).length / todos.length;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-semibold mb-5 mt-2 text-center">
        {"👌 Let's get this ball rolling!"}
      </h1>
      <LoadingBar ratio={doneRatio} />
      <div className="flex flex-col space-y-2">
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
