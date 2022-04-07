import Members from "../../../components/RoundMembers";
import SubMenu from "../../../components/SubMenu";
import PageHero from "../../../components/PageHero";

const RoundMembersPage = ({ round, currentUser }) => {
  if (!round) return null;

  return (
    <div className="flex-1">
      <SubMenu currentUser={currentUser} round={round} />
      {currentUser?.currentCollMember?.isApproved ?
        <Members round={round} currentUser={currentUser} />
      : (
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
