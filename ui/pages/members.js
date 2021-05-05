import OrgMembers from "components/Org/OrgMembers";
import DashboardMenu from "components/SubMenu";

const OrgMembersPage = ({ currentOrgMember }) => {
  const isAdmin = currentOrgMember?.isOrgAdmin;
  if (!isAdmin) return null;

  return (
    <>
      <DashboardMenu currentOrgMember={currentOrgMember} />

      <div className="page">
        <OrgMembers />
      </div>
    </>
  );
};

export default OrgMembersPage;
