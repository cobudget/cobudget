import React from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Card from "./styled/Card";

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
    <div>
      <h2>Events</h2>
      <ul>
        {data &&
          data.events.map(event => (
            <a
              href={`${hostInfo.protocol}://${event.slug}.${hostInfo.host}`}
              target="_blank"
              key={event.slug}
            >
              <li>{event.title}</li>
            </a>
          ))}
      </ul>
    </div>
  );
}

export default LandingPage;
