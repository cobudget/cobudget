import Members from "../../../components/EventMembers";
import SubMenu from "../../../components/SubMenu";
import PageHero from "../../../components/PageHero";

const CollectionMembersPage = ({ collection, currentUser }) => {
  if (!collection) return null;

  return (
    <div className="flex-1">
      <SubMenu currentUser={currentUser} collection={collection} />
      {currentUser?.currentCollMember?.isApproved ||
      currentUser?.currentOrgMember?.isAdmin ? (
        <Members collection={collection} currentUser={currentUser} />
      ) : (
        <PageHero>
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold">
              You need to be a member of this collection to see the member list.
            </h2>
          </div>
        </PageHero>
      )}
    </div>
  );
};

export default CollectionMembersPage;
