import RoundExpenses from "components/RoundExpenses";
import SubMenu from "../../../../components/SubMenu";

const RoundSettingsPage = ({ round, currentUser }) => {
  if (!round) return null;

  return (
    <div className="flex-1">
      <SubMenu currentUser={currentUser} round={round} />
      <RoundExpenses round={round} currentUser={currentUser} />
    </div>
  );
};

export default RoundSettingsPage;
