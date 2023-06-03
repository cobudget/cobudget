import RoundExpenses from "components/RoundExpenses";
import { useRouter } from "next/router";
import SubMenu from "../../../../components/SubMenu";

const RoundSettingsPage = ({ round, currentUser, currentGroup }) => {
  const router = useRouter();

  const isAdmin =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentGroupMember?.isAdmin;

  if (!isAdmin || !round) return null;

  return (
    <div className="flex-1">
        <SubMenu currentUser={currentUser} round={round} />
        <RoundExpenses round={round} />
    </div>
  );
};

export default RoundSettingsPage;
