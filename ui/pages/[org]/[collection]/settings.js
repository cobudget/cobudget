import EventSettings from "../../../components/EventSettings";
import SubMenu from "../../../components/SubMenu";

const EventSettingsPage = ({ collection, currentUser, currentOrg }) => {
  const isAdmin =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentOrgMember?.isAdmin;
  if (!isAdmin || !collection) return null;
  return (
    <div className="flex-1">
      <SubMenu currentUser={currentUser} collection={collection} />
      <EventSettings
        collection={collection}
        currentOrg={currentOrg}
        currentUser={currentUser}
      />
    </div>
  );
};

export default EventSettingsPage;
