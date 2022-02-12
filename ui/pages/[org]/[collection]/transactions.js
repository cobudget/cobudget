import SubMenu from "components/SubMenu";
import Transactions from "../../../components/Transactions";

const TransactionsPage = ({ collection, currentUser, currentOrg }) => {
  const isAdmin =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentOrgMember?.isAdmin;
  if (!isAdmin || !collection) return null;
  return (
    <div className="">
      <SubMenu currentUser={currentUser} collection={collection} />
      <Transactions collection={collection} currentOrg={currentOrg} />
    </div>
  );
};

export default TransactionsPage;
