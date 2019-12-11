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
      images {
        small
        large
      }
    }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);

  @media (max-width: 990px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  @media (max-width: 660px) {
    grid-template-columns: minmax(0, 1fr);
  }
  grid-gap: 25px;
  a {
    text-decoration: none;
    color: #000;
    display: flex;
  }
`;

export default ({ currentUser, event, hostInfo }) => {
  if (!event) return <LandingPage hostInfo={hostInfo} />;

  const { data: { dreams } = { dreams: [] }, loading, error } = useQuery(
    DREAMS_QUERY,
    {
      variables: { eventId: event.id }
    }
  );

  if (!loading && dreams.length === 0) return <div>no dreams!</div>;

  return (
    <Grid>
      {dreams.map(dream => (
        <Link href="/[dream]" as={`/${dream.slug}`} key={dream.slug}>
          <a>
            <DreamCard dream={dream} />
          </a>
        </Link>
      ))}
    </Grid>
  );
};
