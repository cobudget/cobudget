import Members from "../../../components/RoundMembers";
import SubMenu from "../../../components/SubMenu";
import PageHero from "../../../components/PageHero";

const RoundMembersPage = ({ round, currentUser }) => {
  if (!round) return null;

  return (
    <div className="flex-1">
      <SubMenu currentUser={currentUser} round={round} />
      {currentUser?.currentCollMember?.isApproved ||
      currentUser?.currentOrgMember?.isAdmin ? (
        <Members round={round} currentUser={currentUser} />
      ) : (
        <PageHero>
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold">
              You need to be a member of this round to see the member list.
            </h2>
          </div>
        </PageHero>
      )}
    </div>
  );
};

export default RoundMembersPage;
