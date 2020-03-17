import React from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Link from "next/link";
import { Button } from "@material-ui/core";
import { RightArrowIcon } from "./Icons";

const EVENTS_QUERY = gql`
  query Events {
    events {
      id
      slug
      title
    }
  }
`;

function LandingPage({ hostInfo }) {
  const { data, loading, error } = useQuery(EVENTS_QUERY);
  return (
    <div className="mx-auto mt-2 w-full sm:w-64">
      <ul className="bg-white rounded-lg shadow-md overflow-hidden">
        {data &&
          data.events.map(event => (
            <li key={event.slug} className="border-b last:border-0">
              <a
                className="group px-4 py-3 block text-lg text-gray-700 hover:bg-gray-100 flex justify-between items-center "
                href={`${hostInfo.protocol}://${event.slug}.${hostInfo.host}`}
                target="_blank"
              >
                {event.title}
                <RightArrowIcon className="ml-4 w-4 h-4 text-white group-hover:text-gray-600" />
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default LandingPage;
