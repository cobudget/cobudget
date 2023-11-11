import Button from "components/Button";
import { PriceButton } from "components/Group/NewGroup";
import Link from "next/link";
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

function UpgradeGroupModal({ hide, group }) {
  const [plan, setPlan] = useState("");
  const intl = useIntl();

  return (
    <div className="z-50 top-0 left-0 fixed w-screen h-screen bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 w-[200px]">
        <p className="text-xl font-semibold">
          <FormattedMessage defaultMessage="Subscription Over" />
        </p>
        <p className="my-4">
          <FormattedMessage defaultMessage="Group subscription has expired. To continue using the group, please upgrade your subscription." />
        </p>
        <div>
          <div className="my-6">
            <label className="text-sm font-medium mb-2 block">
              <FormattedMessage defaultMessage="Billing period" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <PriceButton
                heading={intl.formatMessage({
                  defaultMessage: "Monthly billing",
                })}
                subheading={intl.formatMessage({
                  defaultMessage: "Most flexible",
                })}
                price="€20"
                period={intl.formatMessage({ defaultMessage: "month" })}
                onClick={() => setPlan("MONTHLY")}
                active={plan === "MONTHLY"}
              />
              <PriceButton
                heading={intl.formatMessage({
                  defaultMessage: "Yearly billing",
                })}
                subheading={intl.formatMessage({
                  defaultMessage: "Best price",
                })}
                price="€200"
                period={intl.formatMessage({ defaultMessage: "year" })}
                onClick={() => setPlan("YEARLY")}
                active={plan === "YEARLY"}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <form
            action={`/api/stripe/create-checkout-session?mode=upgradepaidplan&plan=${plan}&groupId=${group?.id}`}
            method="POST"
          >
            <Button type="submit">
              <FormattedMessage defaultMessage="Upgrade Now" />
            </Button>
          </form>
          <span className="mt-2 cursor-pointer" onClick={hide}>
            <FormattedMessage defaultMessage="Upgrade Later" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default UpgradeGroupModal;
