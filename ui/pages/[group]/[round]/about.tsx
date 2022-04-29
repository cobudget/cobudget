import { gql, useQuery } from "urql";

import About from "../../../components/About";
import SubMenu from "../../../components/SubMenu";
import PageHero from "../../../components/PageHero";
import EditableField from "../../../components/EditableField";
import { HeaderSkeleton } from "components/Skeleton";
import { useRouter } from "next/router";

export const ROUND_QUERY = gql`
  query RoundQuery($groupSlug: String!, $roundSlug: String!) {
    round(groupSlug: $groupSlug, roundSlug: $roundSlug) {
      id
      about
      guidelines {
        id
        title
        description
        position
      }
      maxAmountToBucketPerUser
      allowStretchGoals
      bucketCreationCloses
      grantingOpens
      grantingCloses
      color
      currency
      totalContributions
      totalAllocations
      totalInMembersBalances
      totalContributionsFunding
      totalContributionsFunded
    }
  }
`;

export default function AboutPage({ currentUser }) {
  const router = useRouter();
  const [
    { data: { round } = { round: null }, fetching: loading, error },
  ] = useQuery({
    query: ROUND_QUERY,
    variables: {
      groupSlug: router.query.group,
      roundSlug: router.query.round,
    },
  });
  return (
    <>
      <SubMenu currentUser={currentUser} round={round} />
      <PageHero>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
          <div className="col-span-2">
            {round ? (
              <EditableField
                defaultValue={round.about}
                label="Add about text"
                placeholder={`# About ${round.title}`}
                canEdit={
                  currentUser?.currentGroupMember?.isAdmin ||
                  currentUser?.currentCollMember?.isAdmin
                }
                name="about"
                className="h-10"
                MUTATION={gql`
                  mutation EditRoundAbout($roundId: ID!, $about: String) {
                    editRound(roundId: $roundId, about: $about) {
                      id
                      about
                    }
                  }
                `}
                variables={{ roundId: round.id }}
              />
            ) : (
              <HeaderSkeleton />
            )}
          </div>
        </div>
      </PageHero>
      <div className="page">
        <About router={router} round={round} />
      </div>
    </>
  );
}
