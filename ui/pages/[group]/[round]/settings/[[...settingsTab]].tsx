import { useRouter } from "next/router";
import RoundSettings from "../../../../components/RoundSettings";
import SubMenu from "../../../../components/SubMenu";

const RoundSettingsPage = ({ round, currentUser, currentGroup }) => {
  const router = useRouter();

  const isAdmin =
    currentUser?.currentCollMember?.isAdmin ||
    currentUser?.currentGroupMember?.isAdmin;

  if (!isAdmin || !round) return null;

  return (
    <div className="flex-1">
      <SubMenu currentUser={currentUser} round={round} />
      <RoundSettings
        settingsTabSlug={(router.query?.settingsTab as string[])?.[0] ?? ""}
        round={round}
        currentUser={currentUser}
        currentGroup={currentGroup}
      />
    </div>
  );
};

export default RoundSettingsPage;
