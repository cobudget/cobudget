import React from "react";
import { useQuery } from "@apollo/react-hooks";

import gql from "graphql-tag";
import getHostInfo from "../utils/getHostInfo";
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

const EVENT_QUERY = gql`
  query Event($slug: String!) {
    event(slug: $slug) {
      slug
      description
      title
    }
  }
`;

function Home({ subdomain, host, protocol }) {
  if (!subdomain) {
    const { data, loading, error } = useQuery(EVENTS_QUERY);

    return (
      <div>
        <h1>Events</h1>
        <ul>
          {data &&
            data.events.map(event => (
              <a href={`${protocol}://${event.slug}.${host}`} key={event.slug}>
                <li>{event.title}</li>
              </a>
            ))}
        </ul>
      </div>
    );
  }

  const { data, loading, error } = useQuery(EVENT_QUERY, {
    variables: { slug: subdomain }
  });

  if (!(data && data.event))
    return <div>did not find event with slug: {subdomain}, create event?</div>;

  return <Event event={data.event} />;
}

Home.getInitialProps = async ({ req }) => {
  const { subdomain, host, protocol } = getHostInfo(req);

  return {
    subdomain,
    host,
    protocol
  };
};

export default Home;
