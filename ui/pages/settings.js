import EditOrganization from "components/Org/EditOrganization";
import DashboardMenu from "components/SubMenu";

const OrgSettingsPage = ({ currentOrg, currentOrgMember, currentUser }) => {
  const isAdmin = currentOrgMember?.isOrgAdmin;
  if (!isAdmin) return null;

  return (
    <>
      <DashboardMenu currentOrgMember={currentOrgMember} />
      <div className="page">
        <EditOrganization organization={currentOrg} currentUser={currentUser} />
      </div>
    </>
  );
};

export default OrgSettingsPage;
