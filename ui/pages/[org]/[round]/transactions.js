import SubMenu from "components/SubMenu";
import Transactions from "../../../components/Transactions";

const TransactionsPage = ({ round, currentUser, currentOrg }) => {
  const isAdmin =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentOrgMember?.isAdmin;
  if (!isAdmin || !round) return null;
  return (
    <div className="">
      <SubMenu currentUser={currentUser} round={round} />
      <Transactions round={round} currentOrg={currentOrg} />
    </div>
  );
};

export default TransactionsPage;
