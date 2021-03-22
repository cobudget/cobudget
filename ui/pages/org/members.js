import OrgMembers from "components/Org/OrgMembers";

const OrgMembersPage = ({ currentOrg, currentOrgMember }) => {
  const isAdmin = currentOrgMember?.isOrgAdmin;
  if (!isAdmin) return null;
  return (
    <div className="max-w-screen-md flex-1">
      <OrgMembers org={currentOrg} />
    </div>
  );
};

export default OrgMembersPage;
