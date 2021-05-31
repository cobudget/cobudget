import { useState, useMemo } from "react";

import CustomFields from "./CustomFields";
import GeneralSettings from "./GeneralSettings";
import Guidelines from "./Guidelines";
import Granting from "./Granting";
import DreamReview from "./DreamReview";
import Discourse from "./Discourse";

const defaultTabs = [
  { name: "General", component: GeneralSettings },
  { name: "Guidelines", component: Guidelines },
  { name: "Dream Review", component: DreamReview },
  { name: "Questions", component: CustomFields },
  { name: "Granting", component: Granting },
];

const EventSettings = ({ event, currentOrg, currentOrgMember }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = useMemo(
    () =>
      currentOrg.discourseUrl
        ? defaultTabs.concat({ name: "Discourse", component: Discourse })
        : defaultTabs,
    [currentOrg.discourseUrl]
  );

  const SettingsComponent = tabs[selectedTab].component;
  const handleClose = () => null;
  return (
    <div className="page">
      <div className=" grid grid-cols-6">
        <div className="flex flex-col">
          {tabs.map((tab, i) => (
            <button
              key={tab.name}
              onClick={() => setSelectedTab(i)}
              className={
                "text-left p-2 focus:outline-none font-medium " +
                (selectedTab === i ? "text-black" : "text-gray-500")
              }
            >
              {tab.name}
            </button>
          ))}
        </div>
        <div className="py-6 col-span-4 bg-white rounded-lg shadow overflow-hidden">
          {/* <div className="p-6 col-span-3 max-h-screen overflow-y-scroll mt-10 mb-10"> */}
          <SettingsComponent
            event={event}
            handleClose={handleClose}
            currentOrg={currentOrg}
            currentOrgMember={currentOrgMember}
          />
        </div>
      </div>
    </div>
  );
};

export default EventSettings;
