import Avatar from "../Avatar";
import { FormattedMessage, FormattedNumber } from "react-intl";

export default function Funders({ bucket, currentUser }) {
  if (!bucket) return null;

  // Silent allocation (C-06): server returns anonymised funders (label + amount,
  // no real identity). Show a note so participants know this is intentional.
  const isSilentNonAdmin =
    bucket.round?.silentAllocation && !currentUser?.currentCollMember?.isAdmin;

  return (
    <div className="bg-white border-b-default">
      {isSilentNonAdmin && (
        <div className="page pt-4 pb-1">
          <p className="text-sm text-gray-500 italic">
            <FormattedMessage defaultMessage="Contributions are shown anonymously." />
          </p>
        </div>
      )}
      {bucket.funders?.length ? (
        <div className="page grid gap-10 grid-cols-1 md:grid-cols-sidebar">
          <ul className={`${isSilentNonAdmin ? "pt-2" : "pt-6"} pb-6 space-y-4`}>
            {bucket.funders.map((contribution) => (
              <li className="flex items-center space-x-3" key={contribution.id}>
                <Avatar
                  user={contribution.roundMember?.user ?? null}
                  highlighted={
                    !isSilentNonAdmin &&
                    currentUser?.id === contribution.roundMember?.user?.id
                  }
                />
                <span>
                  {contribution.roundMember?.user?.username ??
                    contribution.roundMember?.user?.name}
                  :{" "}
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
