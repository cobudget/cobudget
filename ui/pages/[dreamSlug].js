import gql from "graphql-tag";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/react-hooks";

const DREAM_QUERY = gql`
  query Dream($slug: String!, $eventId: ID!) {
    dream(slug: $slug, eventId: $eventId) {
      slug
      description
      title
    }
  }
`;

export default ({ event }) => {
  if (!event) return <div>404</div>;
  const router = useRouter();

  const { dreamSlug } = router.query;

  const { data, loading, error } = useQuery(DREAM_QUERY, {
    variables: { slug: dreamSlug, eventId: event.id }
  });

  if (data && !data.dream) return <div>no dream found!</div>;

  return <div>title: {data && data.dream && data.dream.title}</div>;
};
