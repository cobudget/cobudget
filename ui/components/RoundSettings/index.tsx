import { useState, useMemo } from "react";
import CustomFields from "./CustomFields";
import GeneralSettings from "./GeneralSettings";
import Guidelines from "./Guidelines";
import Granting from "./Granting";
import Tags from "./Tags";
import BucketReview from "./BucketReview";
import Discourse from "./Discourse";
import RoundSettingsModalGranting from "./Granting";
import capitalize from "utils/capitalize";

const defaultTabs = [
  { name: "General", component: GeneralSettings },
  { name: "Guidelines", component: Guidelines },
  {
    name: `${capitalize(process.env.BUCKET_NAME_SINGULAR)} Review`,
    component: BucketReview,
  },
  {
    name: `${capitalize(process.env.BUCKET_NAME_SINGULAR)} Form`,
    component: CustomFields,
  },
  { name: "Funding", component: Granting },
  { name: "Tags", component: Tags },
];

const RoundSettings = ({ round, currentUser, currentGroup }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = useMemo(
    () =>
      currentGroup?.discourseUrl
        ? defaultTabs.concat({ name: "Discourse", component: Discourse })
        : defaultTabs,
    [currentGroup?.discourseUrl]
  );

  const SettingsComponent = tabs[selectedTab].component;

  return (
    <div className="page">
      <div className="grid sm:grid-cols-6">
        <div className="flex flex-col mb-4">
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
            round={round}
            currentGroup={currentGroup}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
};

export default RoundSettings;
