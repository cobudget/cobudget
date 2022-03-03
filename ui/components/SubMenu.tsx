import { useRouter } from "next/router";
import Link from "next/link";

const bucketItems = ({ orgSlug, roundSlug, bucketId, bucket }) => {
  return [
    { label: "Bucket", href: `/${orgSlug}/${roundSlug}/${bucketId}` },
    {
      label: `Comments (${bucket.noOfComments})`,
      href: `/${orgSlug}/${roundSlug}/${bucketId}/comments`,
    },
    {
      label: `Funders (${bucket.noOfFunders})`,
      href: `/${orgSlug}/${roundSlug}/${bucketId}/funders`,
    },
  ];
};

const orgItems = ({ currentUser, orgSlug }) => {
  return [
    { label: "Overview", href: `/${orgSlug}` },
    // { label: "Realities", href: "/realities" },
    { label: "Members", href: `/${orgSlug}/members`, admin: true },
    { label: "Settings", href: `/${orgSlug}/settings`, admin: true },
  ].filter((i) => (i.admin ? currentUser?.currentOrgMember?.isAdmin : true));
};

export const roundItems = ({ currentUser, orgSlug, roundSlug }) => {
  const isAdmin =
    currentUser?.currentOrgMember?.isAdmin ||
    currentUser?.currentCollMember?.isAdmin;

  return [
    { label: "Overview", href: `/${orgSlug}/${roundSlug}` },
    { label: "About", href: `/${orgSlug}/${roundSlug}/about` },
    {
      label: "Members",
      href: `/${orgSlug}/${roundSlug}/members`,
      member: true,
    },
    {
      label: "Transactions",
      href: `/${orgSlug}/${roundSlug}/transactions`,
      admin: true,
    },
    {
      label: "Settings",
      href: `/${orgSlug}/${roundSlug}/settings`,
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
        orgSlug: router.query.org,
        bucketId: router.query.bucket,
        bucket,
      })
    : round
    ? roundItems({
        currentUser,
        roundSlug: router.query.round,
        orgSlug: router.query.org,
      })
    : orgItems({ currentUser, orgSlug: router.query.org });

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
