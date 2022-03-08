import SubMenu from "components/SubMenu";
import Transactions from "../../../components/Transactions";

const TransactionsPage = ({ round, currentUser, currentGroup }) => {
  const isAdmin =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentGroupMember?.isAdmin;
  if (!isAdmin || !round) return null;
  return (
    <div className="">
      <SubMenu currentUser={currentUser} round={round} />
      <Transactions round={round} currentGroup={currentGroup} />
    </div>
  );
};

export default TransactionsPage;
