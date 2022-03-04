import EditGroup from "../../components/Org/EditGroup";
import SubMenu from "../../components/SubMenu";

const OrgSettingsPage = ({ currentOrg, currentUser }) => {
  const isAdmin = currentUser?.currentOrgMember?.isAdmin;
  if (!isAdmin) return null;

  return (
    <>
      <SubMenu currentUser={currentUser} />
      <div className="page">
        <EditGroup group={currentOrg} currentUser={currentUser} />
      </div>
    </>
  );
};

export default OrgSettingsPage;
