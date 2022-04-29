import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import capitalize from "utils/capitalize";

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
  {
    slug: `${process.env.BUCKET_NAME_SINGULAR}-review`,
    name: `${capitalize(process.env.BUCKET_NAME_SINGULAR)} Review`,
    component: BucketReview,
  },
  {
    slug: `${process.env.BUCKET_NAME_SINGULAR}-form`,
    name: `${capitalize(process.env.BUCKET_NAME_SINGULAR)} Form`,
    component: CustomFields,
  },
  { slug: "funding", name: "Funding", component: Granting },
  { slug: "tags", name: "Tags", component: Tags },
];

const RoundSettings = ({
  settingsTabSlug,
  round,
  currentUser,
}: {
  settingsTabSlug: string;
  round: any;
  currentUser: any;
}) => {
  const router = useRouter();

  const tabs = useMemo(
    () =>
      round.group?.discourseUrl
        ? defaultTabs.concat({
            slug: "discourse",
            name: "Discourse",
            component: Discourse,
          })
        : defaultTabs,
    [round.group?.discourseUrl]
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
            currentGroup={round.group}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
};

export default RoundSettings;
