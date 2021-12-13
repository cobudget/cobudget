import EditOrganization from "../../components/Org/EditOrganization";
import SubMenu from "../../components/SubMenu";

const OrgSettingsPage = ({ currentOrg, currentUser }) => {
  const isAdmin = currentUser?.currentOrgMember?.isAdmin;
  if (!isAdmin) return null;

  return (
    <>
      <SubMenu currentUser={currentUser} />
      <div className="page">
        <EditOrganization organization={currentOrg} currentUser={currentUser} />
      </div>
    </>
  );
};

export default OrgSettingsPage;
