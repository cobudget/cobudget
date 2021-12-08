import OrgMembers from "../../components/Org/OrgMembers";
import SubMenu from "../../components/SubMenu";

const OrgMembersPage = ({ currentUser, currentOrg }) => {
  const isAdmin = currentUser?.currentOrgMember?.isAdmin;
  if (!isAdmin) return null;

  return (
    <>
      <SubMenu currentUser={currentUser} />

      <div className="page">
        <OrgMembers currentOrg={currentOrg} />
      </div>
    </>
  );
};

export default OrgMembersPage;
