import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Link from "next/link";
import { RightArrowIcon } from "../components/Icons";
import stringToHslColor from "utils/stringToHslColor";

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

export default () => {
  const { data: { events } = { events: [] } } = useQuery(EVENTS_QUERY);
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
