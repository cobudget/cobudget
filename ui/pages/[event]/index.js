import gql from "graphql-tag";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/react-hooks";
import Head from "next/head";
import Link from "next/link";
import CreateDream from "../../components/CreateDream";
import Layout from "../../components/Layout";

export const EVENT_QUERY = gql`
  query Event($slug: String!) {
    event(slug: $slug) {
      id
      slug
      description
      title
      dreams {
        id
        slug
        title
      }
    }
  }
`;

export default ({ currentUser }) => {
  const router = useRouter();
  const { event: slug } = router.query;
  const { data: { event } = { event: null }, loading, error } = useQuery(
    EVENT_QUERY,
    {
      variables: { slug }
    }
  );

  return (
    <Layout currentUser={currentUser} eventSlug={slug}>
      {event && (
        <>
          <h1>Dreams</h1>
          <ul>
            {event.dreams.map(dream => (
              <Link
                href="/[event]/[dream]"
                as={`/${event.slug}/${dream.slug}`}
                key={dream.slug}
              >
                <a>
                  <li>{dream.title}</li>
                </a>
              </Link>
            ))}
          </ul>
        </>
      )}
    </Layout>
  );
};
