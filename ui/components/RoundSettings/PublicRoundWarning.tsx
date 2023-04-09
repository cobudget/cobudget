import Banner from "components/Banner";
import React from "react";
import { useIntl } from "react-intl";
import { HIDDEN, PUBLIC } from "../../constants";

function PublicRoundWarning({ group, visibility }) {
  const intl = useIntl();

  if (group?.visibility === HIDDEN && visibility === PUBLIC) {
    return (
      <div className="text-gray-600">
        <Banner
          className={"mb-4"}
          variant="warning"
          title={intl.formatMessage({
            defaultMessage:
              "Your group is set to private, but if this round is public everyone will be able to see it. Make sure that is what you want.",
          })}
        />
      </div>
    );
  }

  return null;
}

export default PublicRoundWarning;
