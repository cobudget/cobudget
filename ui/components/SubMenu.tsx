import { Box, Typography } from "@material-ui/core";
import WarningIcon from "@material-ui/icons/Warning";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  StripePriceSelect,
  useStripeProductPrices,
} from "components/StripePricing";
import UpgradeMessage from "components/UpgradeMessage";

const bucketItems = (
  { groupSlug, roundSlug, bucketId, bucket },
  formatMessage
) => {
  return [
    {
      label: formatMessage({ defaultMessage: "Bucket" }),
      href: `/${groupSlug}/${roundSlug}/${bucketId}`,
    },
    {
      label: formatMessage(
        { defaultMessage: `Comments ({count})` },
        { count: bucket.noOfComments }
      ),
      href: `/${groupSlug}/${roundSlug}/${bucketId}/comments`,
    },
    {
      label: formatMessage(
        { defaultMessage: `Funders ({count})` },
        { count: bucket.noOfFunders }
      ),
      href: `/${groupSlug}/${roundSlug}/${bucketId}/funders`,
    },
  ];
};

const groupItems = ({ currentUser, groupSlug }, formatMessage) => {
  return [
    {
      label: formatMessage({ defaultMessage: "Rounds" }),
      href: `/${groupSlug == "c" ? "" : groupSlug}`,
    },
    {
      label: formatMessage({ defaultMessage: "Members" }),
      href: `/${groupSlug ?? "c"}/members`,
      admin: true,
    },
    {
      label: formatMessage({ defaultMessage: "Settings" }),
      href: `/${groupSlug ?? "c"}/settings`,
      startsWithHref: true,
      admin: true,
    },
  ].filter((i) => (i.admin ? currentUser?.currentGroupMember?.isAdmin : true));
};

export const roundItems = (
  { currentUser, groupSlug, roundSlug },
  formatMessage
) => {
  const isAdmin = currentUser?.currentCollMember?.isAdmin;
  return [
    {
      label: formatMessage({ defaultMessage: "Overview" }),
      href: `/${groupSlug}/${roundSlug}`,
    },
    {
      label: formatMessage({ defaultMessage: "Feed" }),
      href: `/${groupSlug}/${roundSlug}/image-feed`,
    },
    {
      label: formatMessage({ defaultMessage: "About" }),
      href: `/${groupSlug}/${roundSlug}/about`,
    },
    {
      label: formatMessage({ defaultMessage: "Participants" }),
      href: `/${groupSlug}/${roundSlug}/participants`,
      member: true,
    },
    {
      label: formatMessage({ defaultMessage: "History" }),
      href: `/${groupSlug}/${roundSlug}/history`,
      admin: true,
    },
    {
      label: formatMessage({ defaultMessage: "Expenses" }),
      href: `/${groupSlug}/${roundSlug}/expenses`,
    },
    {
      label: formatMessage({ defaultMessage: "Budget Items" }),
      href: `/${groupSlug}/${roundSlug}/budget-items`,
    },
    {
      label: formatMessage({ defaultMessage: "Settings" }),
      href: `/${groupSlug}/${roundSlug}/settings`,
      startsWithHref: true,
      admin: true,
    },
  ].filter((i) => (i.admin ? isAdmin : true));
};

export default function SubMenu({
  bucket,
  round,
  currentUser,
}: {
  bucket?: any;
  round?: any;
  currentUser: any;
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
    if (loadingPrices) return;

    if (!prices.length) {
      setInitialPriceId(null);
      return;
    }

    const hasSelection =
      initialPriceId && prices.some((price) => price.id === initialPriceId);

    if (!hasSelection) {
      setInitialPriceId((prices.find((p) => p.default) || prices[0]).id);
    }
  }, [loadingPrices, prices, initialPriceId]);

  // Don't render menu until router is ready to prevent hydration mismatch
  // (router.query is empty on server but populated on client)
  if (!router.isReady) {
    return null;
  }

  const items: {
    label: string;
    href: string;
    startsWithHref?: boolean;
    admin?: boolean;
    member?: boolean;
  }[] = router.query.bucket
    ? bucketItems(
        {
          roundSlug: router.query.round,
          groupSlug: router.query.group,
          bucketId: router.query.bucket,
          bucket,
        },
        intl.formatMessage
      )
    : router.query.round
    ? roundItems(
        {
          currentUser,
          roundSlug: router.query.round,
          groupSlug: router.query.group,
        },
        intl.formatMessage
      )
    : groupItems(
        { currentUser, groupSlug: router.query.group ?? "c" },
        intl.formatMessage
      );

  const color = round?.color ?? "anthracit";

  const showUpgradeMessage =
    router.query.group === "c" &&
    round?.membersLimit?.consumedPercentage > 75;

  // don't show the menu if the only option is the default page
  if (items.length === 1) return null;

  return (
    <>
      <div className="space-x-2 bg-white border-b border-b-default">
        <div className="max-w-screen-xl mx-auto flex px-2 md:px-4 overflow-x-auto">
          {items.map((item) => {
            return (
              <Link
                href={item.href}
                key={item.href}
                scroll={!bucket}
                className={`block px-2 py-4 border-b-2 font-medium transition-colors ${
                  (
                    item.startsWithHref
                      ? router.asPath.startsWith(item.href)
                      : item.href === router.asPath
                  )
                    ? `border-${color} text-${color}`
                    : "border-transparent text-gray-500"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      {showUpgradeMessage && <UpgradeMessage round={round} forAdmin={currentUser?.currentCollMember?.isAdmin} />}
    </>
  );
}
