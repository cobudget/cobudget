import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import Card from "../components/styled/Card";
import styled from "styled-components";
import stringToHslColor from "../utils/stringToHslColor";
const DreamCard = styled(Card)`
  padding: 0px;
  > div {
    padding: 25px;
  }
`;

export const DREAM_QUERY = gql`
  query Dream($slug: String!, $eventId: ID!) {
    dream(slug: $slug, eventId: $eventId) {
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

const ImgPlaceholder = styled.div`
  background: ${props => props.color};
  flex: 0 0 200px !important;
  height: 250px;
`;

const Dream = ({ event }) => {
  if (!event) return null;
  const { query } = useRouter();

  if (!query.dream)
    return (
      <DreamCard>
        <div>Loading</div>
      </DreamCard>
    ); // query is empty sometimes..

  const { data: { dream } = { dream: null }, loading, error } = useQuery(
    DREAM_QUERY,
    {
      variables: { slug: query.dream, eventId: event.id }
    }
  );

  return (
    <DreamCard>
      {dream &&
        (dream.images.length > 0 ? (
          <img src={dream.images[0].large} />
        ) : (
          <ImgPlaceholder color={stringToHslColor(dream.title)} />
        ))}
      <div>
        <h1>{dream && dream.title}</h1>
        <p>{dream && dream.description}</p>
      </div>
    </DreamCard>
  );
};

export default Dream;
