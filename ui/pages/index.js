import { forwardRef } from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Link from "next/link";
import Button from "components/Button";

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

const IndexPage = ({ currentOrg }) => {
  // TODO - perhaps a redirect to organization pages instead
  if (!currentOrg) {
    return <LandingPage />;
  }

  const { data: { events } = { events: [] }, loading } = useQuery(EVENTS_QUERY);

  return (
    <div className="max-w-screen-2lg flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {events.map((event) => (
        <Link href="/[event]" as={`/${event.slug}`} key={event.slug} passHref>
          <LinkCard color={event.color}>{event.title}</LinkCard>
        </Link>
      ))}
    </div>
  );
};

export default IndexPage;
