import BucketImport from "components/BucketImport";
import SubMenu from "components/SubMenu";

// Admin-only (UI gate here, API gate in isCollOrGroupAdmin on the resolvers).
const BucketImportPage = ({ round, currentUser }) => {
  const isAdmin =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentGroupMember?.isAdmin;

  if (!isAdmin || !round) return null;

  return (
    <div className="flex-1">
      <SubMenu currentUser={currentUser} round={round} />
      <BucketImport round={round} />
    </div>
  );
};

export default BucketImportPage;
