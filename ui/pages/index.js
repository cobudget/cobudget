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
    }
  }
`;

export default () => {
  const { data: { events } = { events: [] } } = useQuery(EVENTS_QUERY);
  return (
    <div className="grid grid-cols-4 gap-4">
      {events.map((event) => (
        <Link href="/[event]" as={`/${event.slug}`} key={event.slug}>
          <a
            className="group p-4 h-32 font-medium rounded-md block text-white flex justify-between items-start transitions-shadows duration-75 hover:shadow-outline "
            style={{ background: stringToHslColor(event.title, 60, 56) }}
          >
            {event.title}
            <RightArrowIcon className="ml-4 w-4 h-4 text-white" />
          </a>
        </Link>
      ))}
    </div>
  );
};
