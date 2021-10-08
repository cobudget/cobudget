import EventSettings from "components/EventSettings";
import SubMenu from "components/SubMenu";

const EventSettingsPage = ({ event, currentOrgMember, currentOrg }) => {
  const isAdmin =
    currentOrgMember?.currentEventMembership?.isAdmin ||
    currentOrgMember?.isOrgAdmin;
  if (!isAdmin || !event) return null;
  return (
    <div className="flex-1">
      <SubMenu currentOrgMember={currentOrgMember} event={event} />
      <EventSettings
        event={event}
        currentOrg={currentOrg}
        currentOrgMember={currentOrgMember}
      />
    </div>
  );
};

export default EventSettingsPage;
