import { useState, useEffect } from "react";
import { Paper, Tabs, Tab } from "@material-ui/core";
import { useRouter } from "next/router";
import OrgMembers from "components/Org/OrgMembers";
import EditOrganization from "components/Org/EditOrganization";

const TabContainer = ({ children }) => (
  <div className="flex-grow flex justify-center items-center pt-6">
    {children}
  </div>
);

const OrgSettingsPage = ({ currentOrg, currentOrgMember, currentUser }) => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(router.query.tab ?? "general");

  useEffect(() => {
    if (router.query.tab) {
      setCurrentTab(router.query.tab);
    }
  }, [router.query.tab]);

  const isAdmin = currentOrgMember?.isOrgAdmin;
  if (!isAdmin) return null;

  return (
    <div className="max-w-screen-md flex-1">
      <Paper>
        <Tabs
          value={currentTab}
          onChange={(ev, newTab) =>
            router.push(`?tab=${newTab}`, undefined, {
              shallow: true,
            })
          }
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="General" value="general" />
          <Tab label="Members" value="members" />
        </Tabs>
      </Paper>
      <TabContainer>
        {currentTab === "general" && (
          <EditOrganization
            organization={currentOrg}
            currentUser={currentUser}
          />
        )}
        {currentTab === "members" && <OrgMembers />}
      </TabContainer>
    </div>
  );
};

export default OrgSettingsPage;
