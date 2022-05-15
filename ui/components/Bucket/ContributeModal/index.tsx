import { Modal } from "@material-ui/core";
import { Tab } from "@headlessui/react";
import { FormattedMessage } from "react-intl";
import FromBalance from "./FromBalance";
import WithCard from "./WithCard";

const StyledTab = ({ children, color }) => (
  <Tab
    className={({ selected }) =>
      `block px-2 py-4 border-b-2 font-medium transition-colors ${
        selected
          ? `border-${color} text-anthracit`
          : "border-transparent text-gray-500"
      }`
    }
  >
    {children}
  </Tab>
);

const ContributeModal = ({ handleClose, bucket, currentUser }) => {
  return (
    <Modal
      open={true}
      onClose={handleClose}
      className="items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-lg shadow p-6 focus:outline-none flex-1 max-w-sm">
        <h1 className="text-2xl mb-2 font-semibold">
          <FormattedMessage defaultMessage="Contribute to" /> {bucket.title}
        </h1>
        <Tab.Group
          defaultIndex={currentUser.currentCollMember.balance > 0 ? 0 : 1}
        >
          <Tab.List className="space-x-2 max-w-screen-xl mx-auto flex px-2 overflow-x-auto mb-3">
            <StyledTab color={bucket.round.color}>
              <FormattedMessage defaultMessage="From my balance" />
            </StyledTab>
            <StyledTab color={bucket.round.color}>
              {/* TODO: disable if disabled for bucket */}
              <FormattedMessage defaultMessage="Direct with card" />
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
