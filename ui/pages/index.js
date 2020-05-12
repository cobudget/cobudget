import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Link from "next/link";
import { RightArrowIcon } from "../components/Icons";

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
    <div className="mx-auto mt-2 w-full sm:w-64">
      <ul className="bg-white rounded-lg shadow-md overflow-hidden">
        {events.map((event) => (
          <li key={event.slug} className="border-b last:border-0">
            <Link href="/[event]" as={`/${event.slug}`}>
              <a className="group px-4 py-3 block text-lg text-gray-700 hover:bg-gray-100 flex justify-between items-center ">
                {event.title}
                <RightArrowIcon className="ml-4 w-4 h-4 text-white group-hover:text-gray-600" />
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
