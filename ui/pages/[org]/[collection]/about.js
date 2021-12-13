import { gql } from "urql";

import About from "../../../components/About";
import SubMenu from "../../../components/SubMenu";
import PageHero from "../../../components/PageHero";
import EditableField from "../../../components/EditableField";

export default function AboutPage({
  router,
  collection,
  currentUser,
  currentOrg,
}) {
  if (!collection) return null;
  return (
    <>
      <SubMenu currentUser={currentUser} collection={collection} />
      <PageHero>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
          <div className="col-span-2">
            <EditableField
              value={collection.about}
              label="Add about text"
              placeholder={`# About ${collection.title}`}
              canEdit={
                currentUser?.currentOrgMember?.isAdmin ||
                currentUser?.currentCollMember?.isAdmin
              }
              name="about"
              className="h-10"
              MUTATION={gql`
                mutation EditCollectionAbout(
                  $collectionId: ID!
                  $about: String
                ) {
                  editCollection(collectionId: $collectionId, about: $about) {
                    id
                    about
                  }
                }
              `}
              variables={{ collectionId: collection.id }}
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
