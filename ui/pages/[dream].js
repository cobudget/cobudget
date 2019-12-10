import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import Card from "../components/styled/Card";
export const DREAM_QUERY = gql`
  query Dream($slug: String!, $eventId: ID!) {
    dream(slug: $slug, eventId: $eventId) {
      id
      slug
      description
      title
      images
    }
  }
`;

const Dream = ({ event }) => {
  if (!event) return null;
  const { query } = useRouter();

  if (!query.dream) return null; // query is empty sometimes..

  const { data: { dream } = { dream: null }, loading, error } = useQuery(
    DREAMA_QUERY,
    {
      variables: { slug: query.dream, eventId: event.id }
    }
  );

  return (
    <Card>
      <div>
        {dream && dream.images && <img src={dream.images[0]} />}
        <h1>{dream && dream.title}</h1>
        <p>{dream && dream.description}</p>
      </div>
    </Card>
  );
};

export default Dream;
