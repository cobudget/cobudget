import React from "react";
import { useQuery } from "@apollo/react-hooks";
import Link from "next/link";
import gql from "graphql-tag";

const EVENTS_QUERY = gql`
  query Events {
    events {
      id
      slug
      title
    }
  }
`;

function LandingPage() {
  const { data, loading, error } = useQuery(EVENTS_QUERY);
  return (
    // <Layout currentUser={currentUser}>
    <div>
      <h1>LANDING PAGE</h1>
      <ul>
        {data &&
          data.events.map(event => (
            <a
              href={`https://${event.slug}.dreams.wtf`}
              target="_blank"
              key={event.slug}
            >
              <li>{event.title}</li>
            </a>
          ))}
      </ul>
    </div>
    // </Layout>
  );
}

export default LandingPage;
