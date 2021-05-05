import OrgMembers from "components/Org/OrgMembers";
import SubMenu from "components/SubMenu";

const OrgMembersPage = ({ currentOrgMember }) => {
  const isAdmin = currentOrgMember?.isOrgAdmin;
  if (!isAdmin) return null;

  return (
    <>
      <SubMenu currentOrgMember={currentOrgMember} />

      <div className="page">
        <OrgMembers />
      </div>
    </>
  );
};

export default OrgMembersPage;
