import React from "react";
import Head from "next/head";
import { useQuery } from "@apollo/react-hooks";

import gql from "graphql-tag";
import getSubdomain from "../utils/getSubdomain";

const EVENT_QUERY = gql`
  query Event($slug: String!) {
    event(slug: $slug) {
      slug
      description
      title
    }
  }
`;

function Home({ subdomain }) {
  if (!subdomain) return <div>main page!</div>;
  const { data, loading, error } = useQuery(EVENT_QUERY, {
    variables: { slug: subdomain }
  });

  if (error) {
    return <p>Error: {JSON.stringify(error)}</p>;
  }
  return (
    <div>
      <Head>
        <title>Dreams</title>
      </Head>
      <div>event title: {data && data.event && data.event.title}</div>
      <div>subdomain: {subdomain}</div>
    </div>
  );
}

Home.getInitialProps = async ({ req }) => {
  const subdomain = getSubdomain(req);
  return { subdomain };
};

export default Home;
