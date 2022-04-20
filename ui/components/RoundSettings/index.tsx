import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import CustomFields from "./CustomFields";
import GeneralSettings from "./GeneralSettings";
import Guidelines from "./Guidelines";
import Granting from "./Granting";
import Tags from "./Tags";
import BucketReview from "./BucketReview";
import Discourse from "./Discourse";

const defaultTabs = [
  { slug: "", name: "General", component: GeneralSettings },
  { slug: "guidelines", name: "Guidelines", component: Guidelines },
  { slug: "bucket-review", name: "Bucket Review", component: BucketReview },
  { slug: "bucket-form", name: "Bucket Form", component: CustomFields },
  { slug: "funding", name: "Funding", component: Granting },
  { slug: "tags", name: "Tags", component: Tags },
];

const RoundSettings = ({
  settingsTabSlug,
  round,
  currentGroup,
  currentUser,
}: {
  settingsTabSlug: string;
  round: any;
  currentGroup: any;
  currentUser: any;
}) => {
  const router = useRouter();

  const tabs = useMemo(
    () =>
      currentGroup?.discourseUrl
        ? defaultTabs.concat({
            slug: "discourse",
            name: "Discourse",
            component: Discourse,
          })
        : defaultTabs,
    [currentGroup?.discourseUrl]
  );

  const currentTab =
    tabs.find((tab) => tab.slug === settingsTabSlug) ?? tabs[0];

  const SettingsComponent = currentTab.component;

  return (
    <div className="page">
      <div className="grid sm:grid-cols-6">
        <div className="flex flex-col mb-4">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={`/${router.query.group}/${router.query.round}/settings/${tab.slug}`}
            >
              <a
                className={
                  "text-left p-2 focus:outline-none font-medium " +
                  (settingsTabSlug === tab.slug
                    ? "text-black"
                    : "text-gray-500")
                }
              >
                {tab.name}
              </a>
            </Link>
          ))}
        </div>
        <div className="py-6 col-span-4 bg-white rounded-lg shadow overflow-hidden">
          <SettingsComponent
            round={round}
            currentGroup={currentGroup}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
};

export default RoundSettings;
