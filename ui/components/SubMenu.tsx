import { useRouter } from "next/router";
import Link from "next/link";

const bucketItems = ({ groupSlug, roundSlug, bucketId, bucket }) => {
  return [
    { label: "Bucket", href: `/${groupSlug}/${roundSlug}/${bucketId}` },
    {
      label: `Comments (${bucket.noOfComments})`,
      href: `/${groupSlug}/${roundSlug}/${bucketId}/comments`,
    },
    {
      label: `Funders (${bucket.noOfFunders})`,
      href: `/${groupSlug}/${roundSlug}/${bucketId}/funders`,
    },
  ];
};

const groupItems = ({ currentUser, groupSlug }) => {
  return [
    { label: "Overview", href: `/${groupSlug}` },
    // { label: "Realities", href: "/realities" },
    { label: "Participants", href: `/${groupSlug}/participants`, admin: true },
    { label: "Settings", href: `/${groupSlug}/settings`, admin: true },
  ].filter((i) => (i.admin ? currentUser?.currentGroupMember?.isAdmin : true));
};

export const roundItems = ({ currentUser, groupSlug, roundSlug }) => {
  const isAdmin =
    currentUser?.currentGroupMember?.isAdmin ||
    currentUser?.currentCollMember?.isAdmin;

  return [
    { label: "Overview", href: `/${groupSlug}/${roundSlug}` },
    { label: "About", href: `/${groupSlug}/${roundSlug}/about` },
    {
      label: "Participants",
      href: `/${groupSlug}/${roundSlug}/participants`,
      member: true,
    },
    {
      label: "Transactions",
      href: `/${groupSlug}/${roundSlug}/transactions`,
      admin: true,
    },
    {
      label: "Settings",
      href: `/${groupSlug}/${roundSlug}/settings`,
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

  const items = bucket
    ? bucketItems({
        roundSlug: router.query.round,
        groupSlug: router.query.group,
        bucketId: router.query.bucket,
        bucket,
      })
    : round
    ? roundItems({
        currentUser,
        roundSlug: router.query.round,
        groupSlug: router.query.group,
      })
    : groupItems({ currentUser, groupSlug: router.query.group });

  const color = round?.color ?? "anthracit";

  // don't show the menu if the only option is the default page
  if (items.length === 1) return null;

  return (
    <div className="space-x-2 bg-white border-b border-b-default">
      <div className="max-w-screen-xl mx-auto flex px-2 md:px-4 overflow-x-auto">
        {items.map((item) => {
          return (
            <Link href={item.href} key={item.href} scroll={!bucket}>
              <a
                className={`block px-2 py-4 border-b-2 font-medium transition-colors ${
                  item.href === router.asPath
                    ? `border-${color} text-${color}`
                    : "border-transparent text-gray-500"
                }`}
              >
                {item.label}
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
