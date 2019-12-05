import React from "react";
import { useQuery } from "@apollo/react-hooks";
import Link from "next/link";
import gql from "graphql-tag";
import Layout from "../components/Layout";

const EVENTS_QUERY = gql`
  query Events {
    events {
      id
      slug
      title
    }
  }
`;

function Home({ currentUser }) {
  const { data, loading, error } = useQuery(EVENTS_QUERY);
  return (
    <Layout currentUser={currentUser}>
      <div>
        <h1>Events</h1>
        <ul>
          {data &&
            data.events.map(event => (
              <Link href="/[event]" as={`/${event.slug}`} key={event.slug}>
                <a>
                  <li>{event.title}</li>
                </a>
              </Link>
            ))}
        </ul>
      </div>
    </Layout>
  );
}

export default Home;
