import { useRouter } from "next/router";
import GroupSettings from "../../../components/Group/Settings";
import SubMenu from "../../../components/SubMenu";

const GroupSettingsPage = ({ currentGroup, currentUser }) => {
  const isAdmin = currentUser?.currentGroupMember?.isAdmin;
  const router = useRouter();
  if (!isAdmin) return null;

  return (
    <>
      <SubMenu currentUser={currentUser} />
      <div className="page">
        <GroupSettings
          settingsTabSlug={(router.query?.settingsTab as string[])?.[0] ?? ""}
          group={currentGroup}
          currentUser={currentUser}
        />
      </div>
    </>
  );
};

export default GroupSettingsPage;
