import { useEffect, useState, forwardRef } from "react";
import Link from "next/link";
import { useQuery, useMutation, gql } from "urql";
import { CheckIcon } from "components/Icons";
import HappySpinner from "components/HappySpinner";
import NavItem from "components/Header/NavItem";
import ProgressBar from "components/ProgressBar";
import { FormattedMessage, useIntl } from "react-intl";

const GET_TODO_INFO = gql`
  query TodoInfo($groupId: ID!, $groupSlug: String!) {
    groupMembersPage(limit: 2, groupId: $groupId) {
      groupMembers {
        id
      }
    }

    rounds(limit: 1, groupSlug: $groupSlug) {
      id
    }
  }
`;

const SET_TODOS_FINISHED = gql`
  mutation SetTodosFinished($groupId: ID!) {
    setTodosFinished(groupId: $groupId) {
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

const TodoItem = forwardRef(({ onClick, href, todo, index }, ref) => {
  return (
    <a
      className={`py-2 flex space-x-2 rounded ${
        todo.link ? "hover:bg-gray-300 cursor-pointer" : ""
      } ${todo.done ? "opacity-50" : ""}`}
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

const TodoList = ({ currentGroup }) => {
  const [{ data, fetching: loading, error }] = useQuery({
    query: GET_TODO_INFO,
    variables: { groupId: currentGroup.id, groupSlug: currentGroup.slug },
  });
  const [{ data: todoData, error: todoError }, setTodosFinished] = useMutation(
    SET_TODOS_FINISHED
  );
  const [allDone, setAllDone] = useState(false);
  const intl = useIntl();

  const rawTodos = [
    {
      title: intl.formatMessage({ defaultMessage: "Create community" }),
      desc: intl.formatMessage(
        {
          defaultMessage: `This is your own home on the {bucketName} platform, now available under {deployUrl}/{slug}`,
        },
        {
          values: {
            bucketName: process.env.PLATFORM_NAME,
            deployUrl: process.env.DEPLOY_URL,
            slug: currentGroup.slug,
          },
        }
      ),
      link: null,
    },
    {
      title: intl.formatMessage({ defaultMessage: "Invite members" }),
      desc: intl.formatMessage({
        defaultMessage: "Invite your community members by email",
      }),
      link: `/${currentGroup.slug}/members`,
    },
    {
      title: intl.formatMessage({ defaultMessage: "Create first round" }),
      desc: intl.formatMessage({
        defaultMessage:
          "A round is a page for gathering ideas from the community",
      }),
      link: `/${currentGroup.slug}/new-round`,
    },
  ];

  useEffect(() => {
    if (allDone && currentGroup) {
      setTodosFinished({ groupId: currentGroup.id });
    }
  }, [allDone, setTodosFinished, currentGroup]);

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
      done = data?.groupMembers?.length > 1;
    } else if (index === 2) {
      done = data?.rounds.length > 0;
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
        <FormattedMessage defaultMessage="👌 Let's get this ball rolling!" />
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
            window.confirm(
              intl.formatMessage({
                defaultMessage: "Are you sure you want skip this introduction?",
              })
            ) && setTodosFinished({ groupId: currentGroup.id })
          }
          className="text-xs opacity-70 ml-auto"
        >
          <FormattedMessage defaultMessage="Hide intro" />
        </NavItem>
      </div>
    </div>
  );
};

export default TodoList;
