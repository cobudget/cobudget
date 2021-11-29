import OrgMembers from "../../components/Org/OrgMembers";
import SubMenu from "../../components/SubMenu";

const OrgMembersPage = ({ currentOrgMember, currentOrg }) => {
  const isAdmin = currentOrgMember?.isOrgAdmin;
  if (!isAdmin) return null;

  return (
    <>
      <SubMenu currentOrgMember={currentOrgMember} />

      <div className="page">
        <OrgMembers currentOrg={currentOrg} />
      </div>
    </>
  );
};

export default OrgMembersPage;
