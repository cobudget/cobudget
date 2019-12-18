import { Tabs, Tab, Typography, Box } from "@material-ui/core";

import Card from "../components/styled/Card";
import Members from "../components/admin-page/members";
import EditEventForm from "../components/admin-page/EditEventForm";

function TabPanel({ children, activeTab, index }) {
  return activeTab === index && children;
}

export default ({ event, currentMember }) => {
  if (!currentMember || !currentMember.isAdmin)
    return <div>This is for admins</div>;

  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <Card>
      <Tabs
        value={activeTab}
        onChange={(e, i) => setActiveTab(i)}
        indicatorColor="primary"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}
      >
        <Tab label="Memberships" />
        <Tab label="Event details" />
      </Tabs>
      <TabPanel activeTab={activeTab} index={0}>
        <Members />
      </TabPanel>
      <TabPanel activeTab={activeTab} index={1}>
        <Box p={3}>
          <EditEventForm event={event} />
        </Box>
      </TabPanel>
    </Card>
  );
};
