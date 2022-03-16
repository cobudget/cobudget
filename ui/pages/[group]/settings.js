import EditGroup from "../../components/Group/EditGroup";
import SubMenu from "../../components/SubMenu";

const GroupSettingsPage = ({ currentGroup, currentUser }) => {
  const isAdmin = currentUser?.currentGroupMember?.isAdmin;
  if (!isAdmin) return null;

  return (
    <>
      <SubMenu currentUser={currentUser} />
      <div className="page">
        <EditGroup group={currentGroup} currentUser={currentUser} />
      </div>
    </>
  );
};

export default GroupSettingsPage;
