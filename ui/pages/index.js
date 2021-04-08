import { forwardRef } from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Link from "next/link";
import Button from "components/Button";
import TodoList from "components/TodoList";
import { AddIcon } from "components/Icons";

const EVENTS_QUERY = gql`
  query Events {
    events {
      id
      slug
      title
      color
    }
  }
`;

const LandingPage = () => {
  return (
    <div className="max-w-screen-xl pt-10 flex-1 grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h1 className="text-6xl mb-8 font-medium">
          Digital tools for participant-driven culture
        </h1>
        <p className="text-xl text-gray-800 mb-8">
          Plato tools help you gather ideas, take decisions, map needs, budgets
          and areas of responsibility, and provide a socially focused digital
          meeting place for the participants.
        </p>
        <Link href="/organizations/create">
          <Button color="anthracit" size="large">
            Create a Community
          </Button>
        </Link>
      </div>
      <img className="" src="/frihamnstorget.jpeg" />
    </div>
  );
};

const LinkCard = forwardRef((props, ref) => {
  const { color, className, children } = props;
  return (
    <a
      {...props}
      className={
        `bg-${color} ` +
        `ring-${color}-dark hover:ring ` +
        "cursor-pointer group p-4 font-medium rounded-md text-white flex justify-between items-start transitions-shadows duration-75" +
        " " +
        (className ? className : "h-32")
      }
      ref={ref}
    >
      {children}
    </a>
  );
});

const IndexPage = ({ currentOrg, currentOrgMember }) => {
  const { data: { events } = { events: [] } } = useQuery(EVENTS_QUERY, {
    skip: !currentOrg,
  });

  // TODO - perhaps a redirect to organization pages instead
  if (!currentOrg) {
    return <LandingPage />;
  }

  const showTodos = currentOrgMember?.isOrgAdmin && !currentOrg.finishedTodos;

  return (
    <div
      className={`max-w-screen-2lg flex-1 grid gap-14 grid-cols-1 ${
        showTodos ? "md:grid-cols-2" : ""
      }`}
    >
      {showTodos && (
        <div>
          <div className="text-sm text-gray-700 font-medium mb-3 block">
            GET GOING
          </div>
          <TodoList subdomain={currentOrg.subdomain} />
        </div>
      )}
      <div>
        <div className="text-sm text-gray-700 font-medium mb-3 block">
          EVENTS
        </div>
        <div
          className={`grid gap-4 ${
            showTodos
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          }`}
        >
          {events.map((event) => (
            <Link
              href="/[event]"
              as={`/${event.slug}`}
              key={event.slug}
              passHref
            >
              <LinkCard color={event.color}>{event.title}</LinkCard>
            </Link>
          ))}
          {currentOrgMember?.isOrgAdmin && (
            <Link href="/create-event">
              <button
                type="button"
                className="self-center flex items-center justify-center h-32 w-32 border-dashed border-3 rounded bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-500 transition-colors ease-in-out duration-200 pointer-cursor z-10 relative focus:outline-none focus:border-green"
              >
                <AddIcon className="p-8" />
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
