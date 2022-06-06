import Members from "../../../components/RoundMembers";
import SubMenu from "../../../components/SubMenu";
import PageHero from "../../../components/PageHero";
import { useRouter } from "next/router";
import { gql, useQuery } from "urql";

export const ROUND_QUERY = gql`
  query RoundQuery($groupSlug: String!, $roundSlug: String!) {
    round(groupSlug: $groupSlug, roundSlug: $roundSlug) {
      id
      color
      numberOfApprovedMembers
      currency
    }
  }
`;

const RoundMembersPage = ({ currentUser }) => {
  const router = useRouter();
  const [
    { data: { round } = { round: null }, fetching: loading, error },
  ] = useQuery({
    query: ROUND_QUERY,
    variables: {
      groupSlug: router.query.group,
      roundSlug: router.query.round,
    },
    pause: !router.isReady,
  });

  if (!round) return null;

  return (
    <div className="flex-1">
      <SubMenu currentUser={currentUser} round={round} />
      {currentUser?.currentCollMember?.isApproved ? (
        <Members round={round} currentUser={currentUser} />
      ) : (
        <PageHero>
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold">
              You need to be a participant in this round to see the participants
              list.
            </h2>
          </div>
        </PageHero>
      )}
    </div>
  );
};

export default RoundMembersPage;
