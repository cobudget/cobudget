import Button from "components/Button";
import Link from "next/link";
import React from "react";
import { FormattedMessage } from "react-intl";

function UpgradeGroupModal({ hide }) {
  return (
    <div className="z-50 top-0 left-0 fixed w-screen h-screen bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 w-96">
        <p className="text-xl font-semibold">
          <FormattedMessage defaultMessage="Subscription Over" />
        </p>
        <p className="my-4">
          <FormattedMessage defaultMessage="Group subscription has expired. To continue using the group, please upgrade your subscription." />
        </p>
        <div className="flex justify-between">
          <Button>
            <FormattedMessage defaultMessage="Upgrade Now" />
          </Button>
          <span className="mt-2 cursor-pointer" onClick={hide}>
            <FormattedMessage defaultMessage="Upgrade Later" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default UpgradeGroupModal;
