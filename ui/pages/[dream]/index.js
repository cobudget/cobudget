import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import styled from "styled-components";
import Link from "next/link";
import Card from "../../components/styled/Card";
import stringToHslColor from "../../utils/stringToHslColor";
import { isMemberOfDream } from "../../utils/helpers";

// confusing naming, conflicting with other component.
const DreamCard = styled(Card)`
  padding: 0px;
  > div {
    padding: 25px;
  }
  p {
    white-space: pre-line;
  }
  .flex {
    display: flex;
  }
  .main {
    flex: 0 1 70%;
  }
  .sidebar {
    flex: 0 1 30%;
    /* background: #f1f2f3;
    border-radius: 8px;
    padding: 15px; */
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
      members {
        id
      }
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

const Dream = ({ event, currentUser }) => {
  if (!event) return null;
  const router = useRouter();

  const { data: { dream } = { dream: null }, loading, error } = useQuery(
    DREAM_QUERY,
    {
      variables: { slug: router.query.dream, eventId: event.id }
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
        <div className="flex">
          <div className="main">
            <p>{dream && dream.description}</p>
          </div>
          <div className="sidebar">
            {dream && (
              <>
                {dream.minGoal && (
                  <h3>
                    Min goal: {dream.minGoal} {event.currency}
                  </h3>
                )}
                {dream.maxGoal && (
                  <h3>
                    Max goal: {dream.maxGoal} {event.currency}
                  </h3>
                )}
                {isMemberOfDream(currentUser, dream) && (
                  <Link href="/[dream]/edit" as={`/${dream.slug}/edit`}>
                    <a>Edit dream</a>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DreamCard>
  );
};

export default Dream;
