import Avatar from "../Avatar";
import { FormattedMessage, FormattedNumber } from "react-intl";

export default function Funders({ bucket, currentUser }) {
  if (!bucket) return null;

  // Silent allocation (C-06): non-admins don't see individual funders. The
  // server already returns an empty funders list for them, so show an
  // explanatory notice rather than the generic "No contributions yet".
  const hideForSilent =
    bucket.round?.silentAllocation && !currentUser?.currentCollMember?.isAdmin;

  if (hideForSilent) {
    return (
      <div className="bg-white border-b-default">
        <div className="page">
          <div className="text-xl font-medium text-gray-500 py-10 text-center">
            <FormattedMessage defaultMessage="Individual contributions are hidden during the allocation phase." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b-default">
      {bucket.funders.length ? (
        <div className="page grid gap-10 grid-cols-1 md:grid-cols-sidebar">
          <ul className="py-6 space-y-4">
            {bucket.funders.map((contribution) => (
              <li className="flex items-center space-x-3" key={contribution.id}>
                <Avatar
                  user={contribution.roundMember.user}
                  highlighted={
                    currentUser?.id === contribution.roundMember.user.id
                  }
                />

                <span>
                  {contribution.roundMember.user.username}:{" "}
                  <FormattedNumber
                    value={contribution.amount / 100}
                    style="currency"
                    currencyDisplay={"symbol"}
                    currency={bucket.round.currency}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="page">
          <div className="text-xl font-medium text-gray-500 py-10 text-center">
            <FormattedMessage defaultMessage="No contributions yet" />
          </div>
        </div>
      )}
    </div>
  );
}
