import { useState } from "react";
import { Modal } from "@material-ui/core";

import CustomFields from "./CustomFields";
import GeneralSettings from "./GeneralSettings";

const tabs = [
  { name: "General", component: GeneralSettings },
  { name: "Custom fields", component: CustomFields },
];

export default ({ event, handleClose }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const SettingsComponent = tabs[selectedTab].component;

  return (
    <>
      <Modal
        open={true}
        onClose={handleClose}
        className="flex items-start justify-center p-4 md:pt-16 overflow-y-scroll"
      >
        <div className="bg-white rounded-lg shadow overflow-hidden focus:outline-none flex-1 max-w-screen-md grid grid-cols-4">
          <div className="bg-gray-100 shadow-inner pt-6 pb-12">
            <h1 className="text-lg font-semibold mb-4 px-6">Event Settings</h1>
            <div className="flex flex-col">
              {tabs.map((tab, i) => (
                <button
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
          <div className="p-6 col-span-3">
            <SettingsComponent event={event} handleClose={handleClose} />
          </div>
        </div>
      </Modal>
    </>
  );
};
