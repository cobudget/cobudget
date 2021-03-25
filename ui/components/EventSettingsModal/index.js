import { useState } from "react";
import { Modal } from "@material-ui/core";

import CustomFields from "./CustomFields";
import GeneralSettings from "./GeneralSettings";
import Guidelines from "./Guidelines";
import Granting from "./Granting";
import DreamReview from "./DreamReview";

const tabs = [
  { name: "General", component: GeneralSettings },
  { name: "Granting", component: Granting },
  { name: "Guidelines", component: Guidelines },
  { name: "Dream Review", component: DreamReview },
  { name: "Custom fields", component: CustomFields },
];

const EventSettingsModal = ({ event, currentOrgMember, handleClose }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const SettingsComponent = tabs[selectedTab].component;

  return (
    <>
      <Modal
        open={true}
        onClose={handleClose}
        className="flex items-start justify-center p-4 md:pt-16 overflow-y-scroll max-h-screen"
      >
        <div className="bg-white rounded-lg shadow overflow-hidden focus:outline-none flex-1 max-w-screen-md grid grid-cols-4">
          <div className="bg-gray-100 shadow-inner pt-6 pb-12">
            <h1 className="text-lg font-semibold mb-4 px-6">Event Settings</h1>
            <div className="flex flex-col">
              {tabs.map((tab, i) => (
                <button
                  key={tab.name}
                  onClick={() => setSelectedTab(i)}
                  className={
                    "text-left px-6 py-2 focus:outline-none " +
                    (selectedTab === i ? "bg-gray-300" : "")
                  }
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
          <div className="py-6 col-span-3">
            {/* <div className="p-6 col-span-3 max-h-screen overflow-y-scroll mt-10 mb-10"> */}
            <SettingsComponent
              event={event}
              handleClose={handleClose}
              currentOrgMember={currentOrgMember}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EventSettingsModal;
