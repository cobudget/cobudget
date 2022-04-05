import GroupMembers from "../../components/Group/GroupMembers";
import SubMenu from "../../components/SubMenu";

const GroupMembersPage = ({ currentUser, currentGroup }) => {
  const isAdmin = currentUser?.currentGroupMember?.isAdmin;
  if (!isAdmin) return null;

  return (
    <>
      <SubMenu currentUser={currentUser} />

      <div className="page">
        <GroupMembers currentGroup={currentGroup} />
      </div>
    </>
  );
};

export default GroupMembersPage;
