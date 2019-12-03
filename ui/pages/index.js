import React from "react";
import { useQuery } from "@apollo/react-hooks";

import gql from "graphql-tag";
import Event from "../components/Event";

const EVENTS_QUERY = gql`
  query Events {
    events {
      slug
      title
      description
    }
  }
`;

function Home({ hostInfo, event }) {
  if (!hostInfo.subdomain) {
    const { data, loading, error } = useQuery(EVENTS_QUERY);

    return (
      <div>
        <h1>Events</h1>
        <ul>
          {data &&
            data.events.map(event => (
              <a
                href={`${hostInfo.protocol}://${event.slug}.${hostInfo.host}`}
                key={event.slug}
              >
                <li>{event.title}</li>
              </a>
            ))}
        </ul>
      </div>
    );
  }

  if (!event)
    return (
      <div>
        did not find event with slug: {hostInfo.subdomain}, create event?
      </div>
    );

  return <Event event={event} />;
}

export default Home;
