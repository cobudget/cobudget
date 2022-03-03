import RoundSettings from "../../../components/RoundSettings";
import SubMenu from "../../../components/SubMenu";

const RoundSettingsPage = ({ round, currentUser, currentOrg }) => {
  const isAdmin =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentOrgMember?.isAdmin;
  if (!isAdmin || !round) return null;
  return (
    <div className="flex-1">
      <SubMenu currentUser={currentUser} round={round} />
      <RoundSettings
        round={round}
        currentOrg={currentOrg}
        currentUser={currentUser}
      />
    </div>
  );
};

export default RoundSettingsPage;
