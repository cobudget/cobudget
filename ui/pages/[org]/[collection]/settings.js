import RoundSettings from "../../../components/RoundSettings";
import SubMenu from "../../../components/SubMenu";

const RoundSettingsPage = ({ collection, currentUser, currentOrg }) => {
  const isAdmin =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentOrgMember?.isAdmin;
  if (!isAdmin || !collection) return null;
  return (
    <div className="flex-1">
      <SubMenu currentUser={currentUser} collection={collection} />
      <RoundSettings
        collection={collection}
        currentOrg={currentOrg}
        currentUser={currentUser}
      />
    </div>
  );
};

export default RoundSettingsPage;
