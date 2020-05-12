import { Tabs, Tab, Box } from "@material-ui/core";

import Card from "../styled/Card";
import Members from "./members";
import EditEventForm from "./EditEventForm";
import Granting from "./Granting";

function TabPanel({ children, activeTab, index }) {
  return activeTab === index && children;
}

export default ({ event }) => {
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
        <Tab label="Granting" />
      </Tabs>
      <TabPanel activeTab={activeTab} index={0}>
        <Members event={event} />
      </TabPanel>
      <TabPanel activeTab={activeTab} index={1}>
        <Box p={3}>
          <EditEventForm event={event} />
        </Box>
      </TabPanel>
      <TabPanel activeTab={activeTab} index={2}>
        <Granting event={event} />
      </TabPanel>
    </Card>
  );
};
