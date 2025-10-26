import { Box, Typography } from "@material-ui/core";
import WarningIcon from "@material-ui/icons/Warning";
import {
  StripePriceSelect,
  useStripeProductPrices,
} from "components/StripePricing";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

export default function UpgradeMessage({
  round,
  forAdmin,
}: {
  round?: any;
  forAdmin?: boolean;
}) {
  const router = useRouter();
  const intl = useIntl();
  const [initialPriceId, setInitialPriceId] = useState<string | null>(null);

  const {
    prices,
    loading: loadingPrices,
    error: priceError,
  } = useStripeProductPrices();

  useEffect(() => {
    if (!forAdmin || loadingPrices) return;

    if (!prices.length) {
      setInitialPriceId(null);
      return;
    }

    const hasSelection =
      initialPriceId && prices.some((price) => price.id === initialPriceId);

    if (!hasSelection) {
      setInitialPriceId((prices.find((p) => p.default) || prices[0]).id);
    }
  }, [loadingPrices, prices, initialPriceId, forAdmin]);

  return (
    <div className="space-x-2 bg-white border-b border-b-default bg-yellow-100">
      <div className="max-w-screen-xl mx-auto flex flex-col items-start px-2 md:px-4 overflow-x-auto py-4">
        {forAdmin ? (
          <>
            <Box className="title mx-10 flex items-center px-2 md:px-4 overflow-x-auto py-2">
              <WarningIcon className="text-gray-500" style={{ fontSize: 50 }} />
              <Typography
                component="span"
                variant="h6"
                style={{ marginLeft: 12 }}
              >
                {round?.membersLimit.currentCount >=
                round?.membersLimit.limit ? (
                  <FormattedMessage
                    defaultMessage={"You’ve reached the {limit} user limit."}
                    values={{
                      b: (msg) => <span>{msg}</span>,
                      limit: round.membersLimit.limit,
                    }}
                  />
                ) : (
                  <FormattedMessage
                    defaultMessage="Round is nearing the {limit} member limit."
                    values={{
                      b: (msg) => <span>{msg}</span>,
                      limit: round.membersLimit.limit,
                    }}
                  />
                )}
              </Typography>
            </Box>
            <Box className="text mx-10 px-2 md:px-4 overflow-x-auto">
              <Typography className="py-1" variant="body1">
                <FormattedMessage defaultMessage="Cobudget is an open-source project run by a volunteer team." />
              </Typography>
              <Typography className="py-1" variant="body1">
                <FormattedMessage
                  defaultMessage="To keep Cobudget available, we depend on our users to financially contribute within their means. 
  Please choose a contribution amount below to continue using Cobudget."
                />
              </Typography>
            </Box>
            <Box className="selector mx-10 px-2 md:px-4 overflow-x-auto py-4">
              <StripePriceSelect
                options={prices}
                value={initialPriceId}
                onChange={(selectedPriceId) =>
                  router.push(
                    `/new-group?roundId=${round?.id}&priceId=${selectedPriceId}`
                  )
                }
                disabled={loadingPrices || !!priceError}
                label={intl.formatMessage({
                  defaultMessage: "Choose a plan",
                })}
              />
            </Box>
            <Box className="learn-more mx-10 px-2 md:px-4 overflow-x-auto">
              <a
                href="https://cobudget.com/about"
                target="_blank"
                rel="noreferrer"
              >
                <Typography
                  variant="body2"
                  className="text-blue-700"
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  <FormattedMessage defaultMessage="Learn more about this project." />
                </Typography>
              </a>
            </Box>
            <Box className="contact mx-10 px-2 md:px-4 overflow-x-auto py-4">
              <Typography variant="body2">
                <FormattedMessage defaultMessage="Please contact us to discuss if:" />
                <ul style={{ listStyleType: "disc", marginLeft: 20 }}>
                  <li>
                    <FormattedMessage defaultMessage="You’d like to contribute a different sum." />
                  </li>
                  <li>
                    <FormattedMessage defaultMessage="A financial contribution would hinder your use of Cobudget." />
                  </li>
                  <li>
                    <FormattedMessage defaultMessage="You’re managing multiple rounds for the same group of people, and want to group them under one payment." />
                  </li>
                  <li>
                    <FormattedMessage defaultMessage="You have other questions about our self-set pricing model." />
                  </li>
                </ul>
              </Typography>
            </Box>
          </>
        ) : (
          <>
            <Box className="title mx-10 flex items-center px-2 md:px-4 overflow-x-auto py-2">
              <WarningIcon className="text-gray-500" style={{ fontSize: 50 }} />
              <Typography
                component="span"
                variant="h6"
                style={{ marginLeft: 12 }}
              >
                {round?.membersLimit.currentCount >=
                round?.membersLimit.limit ? (
                  <FormattedMessage
                    defaultMessage={
                      "This round has reached the {limit} user limit."
                    }
                    values={{
                      b: (msg) => <span>{msg}</span>,
                      limit: round.membersLimit.limit,
                    }}
                  />
                ) : (
                  <FormattedMessage
                    defaultMessage="Round is nearing the {limit} member limit."
                    values={{
                      b: (msg) => <span>{msg}</span>,
                      limit: round.membersLimit.limit,
                    }}
                  />
                )}
              </Typography>
            </Box>
            <Box className="text mx-10 px-2 md:px-4 overflow-x-auto">
              <Typography className="py-1" variant="body1">
                <FormattedMessage defaultMessage="All actions have been disabled." />
              </Typography>
              <Typography className="py-1" variant="body1">
                <FormattedMessage defaultMessage="To re-activate this round, please contact your admin to setup a financial contribution for your group. " />
              </Typography>
            </Box>
          </>
        )}
      </div>
    </div>
  );
}
