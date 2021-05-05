import Members from "components/EventMembers";
import SubMenu from "components/SubMenu";
const EventMembersPage = ({ event, currentOrgMember }) => {
  const isAdmin =
    currentOrgMember?.currentEventMembership?.isAdmin ||
    currentOrgMember?.isOrgAdmin;
  if (!isAdmin || !event) return null;
  return (
    <div className="flex-1">
      <SubMenu currentOrgMember={currentOrgMember} event={event} />
      <Members event={event} />
    </div>
  );
};

export default EventMembersPage;
