import { Modal } from "@material-ui/core";
import Tooltip from "@tippyjs/react";

import { Tab } from "@headlessui/react";
import { FormattedMessage } from "react-intl";
import FromBalance from "./FromBalance";
import WithCard from "./WithCard";

const StyledTab = ({ children, color, disabled = false }) => (
  <Tab
    disabled={disabled}
    className={({ selected }) =>
      `block px-2 py-4 border-b-2 font-medium transition-colors ${
        disabled ? "cursor-not-allowed" : ""
      } ${
        selected
          ? `border-${color} text-anthracit`
          : `border-transparent text-gray-${disabled ? 400 : 500}`
      }`
    }
  >
    {children}
  </Tab>
);

const ContributeModal = ({
  handleClose,
  bucket,
  currentUser,
  currentGroup,
}) => {
  const directFundingEnabled =
    bucket.directFundingEnabled && bucket.round.directFundingEnabled;

  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-sm m-auto">
        <h1 className="text-2xl mb-2 font-semibold">
          <FormattedMessage defaultMessage="Contribute to" /> {bucket.title}
        </h1>
        <Tab.Group
          defaultIndex={currentUser.currentCollMember.balance > 0 ? 0 : 1}
        >
          <Tab.List
            className={`space-x-2 max-w-screen-xl mx-auto flex px-2 overflow-x-auto mb-3 ${
              currentGroup?.experimentalFeatures ? "" : "hidden"
            }`}
          >
            <StyledTab color={bucket.round.color}>
              <FormattedMessage defaultMessage="From my balance" />
            </StyledTab>
            <StyledTab
              color={bucket.round.color}
              disabled={!directFundingEnabled}
            >
              <Tooltip
                content={
                  directFundingEnabled
                    ? ""
                    : "Direct funding not enabled for this bucket and/or round"
                }
                placement="bottom"
                arrow={false}
              >
                <span>
                  <FormattedMessage defaultMessage="Direct with card" />
                </span>
              </Tooltip>
            </StyledTab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <FromBalance
                currentUser={currentUser}
                bucket={bucket}
                handleClose={handleClose}
              />
            </Tab.Panel>
            <Tab.Panel>
              <WithCard bucket={bucket} handleClose={handleClose} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Modal>
  );
};

export default ContributeModal;
