import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Link from "next/link";

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

export default ({currentOrg}) => {
  const { data: { events } = { events: [] }, loading } = useQuery(EVENTS_QUERY);

  // TODO - perhaps a redirect to organization pages instead
  if(!currentOrg) {
    return (<div><h1 className="text-2xl">404 - Cant find this organization</h1></div>);
  }

  return (
    <div className="max-w-screen-2lg flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {events.map((event) => (
        <Link href="/[event]" as={`/${event.slug}`} key={event.slug}>
          <a
            className={
              `bg-${event.color || "black"} ` +
              `hover:shadow-outline-${event.color}-darker ` +
              "group p-4 h-32 font-medium rounded-md block text-white flex justify-between items-start transitions-shadows duration-75"
            }
          >
            {event.title}
          </a>
        </Link>
      ))}
    </div>
  );
};
