import SubMenu from "components/SubMenu";
import Contributions from "components/Contributions";

const ContributionsPage = ({ event, currentOrg, currentOrgMember }) => {
  const isAdmin =
    currentOrgMember?.currentEventMembership?.isAdmin ||
    currentOrgMember?.isOrgAdmin;
  if (!isAdmin || !event) return null;
  return (
    <div className="">
      <SubMenu currentOrgMember={currentOrgMember} event={event} />
      <Contributions event={event} currentOrg={currentOrg} />
    </div>
  );
};

export default ContributionsPage;
