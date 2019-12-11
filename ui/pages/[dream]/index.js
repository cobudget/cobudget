import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import styled from "styled-components";
import Link from "next/link";
import Card from "../../components/styled/Card";
import stringToHslColor from "../../utils/stringToHslColor";

// confusing naming, conflicting with other component.
const DreamCard = styled(Card)`
  padding: 0px;
  > div {
    padding: 25px;
  }
  p {
    white-space: pre-line;
  }
`;

export const DREAM_QUERY = gql`
  query Dream($slug: String!, $eventId: ID!) {
    dream(slug: $slug, eventId: $eventId) {
      id
      slug
      description
      title
      minGoal
      maxGoal
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
  const router = useRouter();
  console.log({ routerInFunctionalComp: router });
  const { data: { dream } = { dream: null }, loading, error } = useQuery(
    DREAM_QUERY,
    {
      variables: { slug: router.query.dream, eventId: event.id }
    }
  );

  console.log({ dream });

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
      {dream && (
        <Link href="/[dream]/edit" as={`/${dream.slug}/edit`}>
          Edit
        </Link>
      )}
    </DreamCard>
  );
};

// Dream.getInitialProps = async (first, second) => {
//   console.log({ first, second });
//   return {};
// };

export default Dream;
