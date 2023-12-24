import Button from "components/Button";
import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";

export default function Subscription({ group, currentUser }) {
  return (
    <div className="px-6 flex-1 space-y-4">
      <h1 className="text-2xl font-semibold">
        <FormattedMessage defaultMessage="Billing" />
      </h1>
      <Button
        href={
          "/api/stripe/create-stripe-billing-portal-url?groupId=" + group.id
        }
      >
        <FormattedMessage defaultMessage="Manage billing in Stripe portal" />
      </Button>
      {group?.subscriptionStatus?.isActive === false && (
        <div className="mt-4">
          <Button
            onClick={() => {
              const event = new CustomEvent("show-upgrade-group-message", {
                detail: { groupId: group?.id },
              });
              window.dispatchEvent(event);
            }}
          >
            <FormattedMessage defaultMessage="Upgrade Group" />
          </Button>
        </div>
      )}
    </div>
  );
}
