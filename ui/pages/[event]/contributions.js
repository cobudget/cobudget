import SubMenu from "components/SubMenu";
import Contributions from "components/ContributionsRename";

const ContributionsPage = ({ event, currentOrgMember }) => {
  const isAdmin =
    currentOrgMember?.currentEventMembership?.isAdmin ||
    currentOrgMember?.isOrgAdmin;
  if (!isAdmin || !event) return null;
  return (
    <div className="">
      <SubMenu currentOrgMember={currentOrgMember} event={event} />
      <Contributions event={event} />
    </div>
  );
};

export default ContributionsPage;
