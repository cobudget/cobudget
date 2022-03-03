import { gql } from "urql";

import About from "../../../components/About";
import SubMenu from "../../../components/SubMenu";
import PageHero from "../../../components/PageHero";
import EditableField from "../../../components/EditableField";

export default function AboutPage({
  router,
  round,
  currentUser,
  currentOrg,
}) {
  if (!round) return null;
  return (
    <>
      <SubMenu currentUser={currentUser} round={round} />
      <PageHero>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
          <div className="col-span-2">
            <EditableField
              defaultValue={round.about}
              label="Add about text"
              placeholder={`# About ${round.title}`}
              canEdit={
                currentUser?.currentOrgMember?.isAdmin ||
                currentUser?.currentCollMember?.isAdmin
              }
              name="about"
              className="h-10"
              MUTATION={gql`
                mutation EditRoundAbout(
                  $roundId: ID!
                  $about: String
                ) {
                  editRound(roundId: $roundId, about: $about) {
                    id
                    about
                  }
                }
              `}
              variables={{ roundId: round.id }}
            />
          </div>
        </div>
      </PageHero>
      <div className="page">
        <About router={router} currentOrg={currentOrg} />
      </div>
    </>
  );
}
