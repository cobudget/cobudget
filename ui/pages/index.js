import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import Head from "next/head";
import styled from "styled-components";
import Link from "next/link";
import LandingPage from "../components/LandingPage";
import DreamCard from "../components/DreamCard";

export const DREAMS_QUERY = gql`
  query Dreams($eventId: ID!) {
    dreams(eventId: $eventId) {
      id
      slug
      description
      title
      images
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 20px;
  a {
    text-decoration: none;
    color: #000;
    display: flex;
  }
`;

export default ({ currentUser, event }) => {
  if (!event) return <LandingPage />;

  const { data: { dreams } = { dreams: [] }, loading, error } = useQuery(
    DREAMSA_QUERY,
    {
      variables: { eventId: event.id }
    }
  );
  if (dreams.length === 0) return <div>no dreams!</div>;
  console.log({ dreams });
  return (
    <>
      <Grid>
        {dreams.map(dream => (
          <Link href="/[dream]" as={`/${dream.slug}`} key={dream.slug}>
            <a>
              <DreamCard dream={dream} />
            </a>
          </Link>
        ))}
      </Grid>
    </>
  );
};
