import gql from "graphql-tag";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/react-hooks";
import Layout from "../../components/Layout";

const DREAM_QUERY = gql`
  query Dream($slug: String!, $eventSlug: String!) {
    dream(slug: $slug, eventSlug: $eventSlug) {
      id
      slug
      description
      title
    }
  }
`;

export default ({ currentUser }) => {
  const router = useRouter();
  const { dream: slug, event: eventSlug } = router.query;

  const { data: { dream } = { dream: null }, loading, error } = useQuery(
    DREAM_QUERY,
    {
      variables: { slug, eventSlug }
    }
  );

  return (
    <Layout
      eventSlug={eventSlug}
      currentUser={currentUser}
      title={dream && dream.title}
    >
      <div>
        <h1>{dream && dream.title}</h1>
        <p>{dream && dream.description}</p>
      </div>
    </Layout>
  );
};
