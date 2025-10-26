import Button from "components/Button";
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  StripePriceSelect,
  useStripeProductPrices,
} from "components/StripePricing";

function UpgradeGroupModal({ hide, group }) {
  const intl = useIntl();
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const {
    prices,
    loading: loadingPrices,
    error: priceError,
  } = useStripeProductPrices();

  useEffect(() => {
    if (loadingPrices) return;
    if (!prices.length) {
      setSelectedPriceId(null);
      return;
    }
    const currentExists =
      selectedPriceId &&
      prices.some((price) => price.id === selectedPriceId);
    if (!currentExists) {
      setSelectedPriceId((prices.find((p) => p.default) || prices[0]).id);
    }
  }, [loadingPrices, prices, selectedPriceId]);

  return (
    <div className="z-50 top-0 left-0 fixed w-screen h-screen bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 w-10/12 md:w-1/2">
        <p className="text-xl font-semibold">
          <FormattedMessage defaultMessage="Subscription Over" />
        </p>
        <p className="my-4">
          <FormattedMessage
            defaultMessage={`Group subscription has expired. To continue using the group, please upgrade your subscription. Groups can have up to 1000 participants per round, and an unlimited number of rounds. For even larger rounds, <a>get in touch</a>.`}
            values={{
              a: (v) => (
                <a
                  className="underline"
                  href="mailto:hello@cobudget.com?subject=Custom size round"
                >
                  {v}
                </a>
              ),
            }}
          />
        </p>
        <div>
          <div className="my-6">
            <label className="text-sm font-medium mb-2 block">
              <FormattedMessage defaultMessage="Subscription plan" />
            </label>
            <div className="mt-4">
              <StripePriceSelect
                options={prices}
                value={selectedPriceId}
                onChange={setSelectedPriceId}
                disabled={loadingPrices || !!priceError}
                label={intl.formatMessage({
                  defaultMessage: "Choose a plan",
                })}
              />
            </div>
            {loadingPrices && (
              <p className="text-sm text-gray-500 mt-2">
                <FormattedMessage defaultMessage="Loading subscription options..." />
              </p>
            )}
            {priceError && (
              <p className="text-sm text-red-500 mt-2">
                <FormattedMessage defaultMessage="We were unable to load the available subscription plans. Please try again later." />
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <form
            action={`/api/stripe/create-checkout-session?mode=upgradepaidplan&priceId=${
              selectedPriceId ?? ""
            }&groupId=${group?.id}`}
            method="POST"
          >
            <input type="hidden" name="priceId" value={selectedPriceId ?? ""} />
            <Button
              type="submit"
              disabled={
                !selectedPriceId || loadingPrices || !!priceError || !group?.id
              }
            >
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
