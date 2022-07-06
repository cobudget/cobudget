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
        Manage billing in Stripe portal
      </Button>
    </div>
  );
}
