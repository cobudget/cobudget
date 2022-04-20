import RoundSettings from "../../../../components/RoundSettings";
import SubMenu from "../../../../components/SubMenu";

const RoundSettingsPage = ({ round, currentUser, currentGroup }) => {
  const isAdmin =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentGroupMember?.isAdmin;
  if (!isAdmin || !round) return null;
  return (
    <div className="flex-1">
      <SubMenu currentUser={currentUser} round={round} />
      <RoundSettings
        round={round}
        currentGroup={currentGroup}
        currentUser={currentUser}
      />
    </div>
  );
};

export default RoundSettingsPage;
