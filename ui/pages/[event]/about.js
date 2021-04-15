import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import About from "components/About";
import HappySpinner from "components/HappySpinner";
export const EVENT_QUERY = gql`
  query EventQuery($slug: String) {
    event(slug: $slug) {
      id
      about
      guidelines {
        id
        title
        description
        position
      }
      maxAmountToDreamPerUser
      allowStretchGoals
      dreamCreationCloses
      grantingOpens
      grantingCloses
      color
      currency
      totalContributions
      totalAllocations
      totalContributionsFunding
      totalContributionsFunded
    }
  }
`;

export default function AboutPage({ router }) {
  const { data: { event } = {}, loading } = useQuery(EVENT_QUERY, {
    variables: { slug: router.query.event },
  });

  if (loading)
    return (
      <div className="flex-grow flex justify-center items-center">
        <HappySpinner />
      </div>
    );

  if (!event) return null;
  return (
    <div className="max-w-screen-md flex-1">
      <About event={event} />
    </div>
  );
}
