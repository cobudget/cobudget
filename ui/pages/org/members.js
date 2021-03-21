import OrgMembers from "components/Org/OrgMembers";

export default ({ currentOrg, currentOrgMember }) => {
  const isAdmin = currentOrgMember?.isOrgAdmin;
  if (!isAdmin) return null;
  return (
    <div className="max-w-screen-md flex-1">
      <OrgMembers org={currentOrg} />
    </div>
  );
};
