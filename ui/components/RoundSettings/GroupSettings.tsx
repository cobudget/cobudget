import Button from "components/Button";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import ChangeRoundGroup from "./ChangeRoundGroup";

function GroupSettings({ round, currentUser, currentGroup }: any) {
  const [showChangeRoundGroup, setShowChangeRoundGroup] = useState(false);

  return (
    <>
      <div className="py-2">
        <h2 className="text-2xl font-semibold px-6">
          <FormattedMessage defaultMessage="Group" />
        </h2>
        <div className="my-6 px-6 border-b border-b-default pb-2">
          {currentGroup ? (
            <div>
              <p className="font-bold">{currentGroup?.name}</p>
              <p>
                <FormattedMessage defaultMessage="This round is already connected to a group" />
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4">
              <div className="col-span-3">
                <p className="font-bold">
                  <FormattedMessage defaultMessage="Move to group" />
                </p>
                <p>
                  <FormattedMessage defaultMessage="This round has no group" />
                </p>
              </div>
              <div>
                <Button
                  className="float-right"
                  onClick={() => setShowChangeRoundGroup(true)}
                >
                  <FormattedMessage defaultMessage="Move to group" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showChangeRoundGroup && <ChangeRoundGroup />}
    </>
  );
}

export default GroupSettings;
