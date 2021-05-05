import EventSettings from "components/EventSettings";
import DashboardMenu from "components/SubMenu";

const EventSettingsPage = ({ event, currentOrgMember, currentOrg }) => {
  const isAdmin =
    currentOrgMember?.currentEventMembership?.isAdmin ||
    currentOrgMember?.isOrgAdmin;
  if (!isAdmin || !event) return null;
  return (
    <div className="flex-1">
      <DashboardMenu currentOrgMember={currentOrgMember} event={event} />
      <EventSettings
        event={event}
        currentOrg={currentOrg}
        currentOrgMember={currentOrgMember}
      />
    </div>
  );
};

export default EventSettingsPage;
