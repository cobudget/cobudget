import Members from "components/members";

const EventMembersPage = ({ event, currentOrgMember }) => {
  const isAdmin =
    currentOrgMember?.currentEventMembership?.isAdmin ||
    currentOrgMember?.isOrgAdmin;
  if (!isAdmin || !event) return null;
  return (
    <div className="max-w-screen-md flex-1">
      <Members event={event} />
    </div>
  );
};

export default EventMembersPage;
