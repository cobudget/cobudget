import { useState } from "react";
import OrgMembers from "components/Org/OrgMembers";
import { Paper, Tabs, Tab } from "@material-ui/core";

const OrgSettingsPage = ({ currentOrg, currentOrgMember }) => {
  const [currentTab, setCurrentTab] = useState("members");

  const isAdmin = currentOrgMember?.isOrgAdmin;
  if (!isAdmin) return null;

  return (
    <div className="max-w-screen-md flex-1">
      <Paper>
        <Tabs
          value={currentTab}
          onChange={(ev, newTab) => setCurrentTab(newTab)}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="General" value="general" />
          <Tab label="Members" value="members" />
        </Tabs>
      </Paper>
      {currentTab === "general" && (
        <div>
          <div>general settings here</div>
        </div>
      )}
      {currentTab === "members" && (
        <div>
          <OrgMembers org={currentOrg} />
        </div>
      )}
    </div>
  );
};

export default OrgSettingsPage;
