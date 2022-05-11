import { gql, useQuery } from "urql";

import SubMenu from "../../../components/SubMenu";
import PageHero from "../../../components/PageHero";
import EditableField from "../../../components/EditableField";
import { HeaderSkeleton } from "components/Skeleton";
import { useRouter } from "next/router";

export const ROUND_QUERY = gql`
  query RoundQuery($groupSlug: String!, $roundSlug: String!) {
    round(groupSlug: $groupSlug, roundSlug: $roundSlug) {
      id
      faq
      title
    }
  }
`;

export default function FAQPage({ currentUser }) {
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
                defaultValue={round.faq}
                label="Add faq content"
                canEdit={
                  currentUser?.currentGroupMember?.isAdmin ||
                  currentUser?.currentCollMember?.isAdmin
                }
                name="faq"
                className="h-10"
                MUTATION={gql`
                  mutation EditRoundFAQ($roundId: ID!, $faq: String) {
                    editRound(roundId: $roundId, faq: $faq) {
                      id
                      faq
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
      </div>
    </>
  );
}
