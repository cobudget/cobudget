import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useIntl } from "react-intl";

import capitalize from "utils/capitalize";

import CustomFields from "./CustomFields";
import GeneralSettings from "./GeneralSettings";
import Guidelines from "./Guidelines";
import Granting from "./Granting";
import Tags from "./Tags";
import BucketReview from "./BucketReview";
import Discourse from "./Discourse";
import Integrations from "./Integrations";

const RoundSettings = ({
  settingsTabSlug,
  round,
  currentUser,
  currentGroup,
}: {
  settingsTabSlug: string;
  round: any;
  currentUser: any;
  currentGroup: any;
}) => {
  const intl = useIntl();
  const router = useRouter();

  const defaultTabs = useMemo(
    () => [
      {
        slug: "",
        name: intl.formatMessage({ defaultMessage: "General" }),
        component: GeneralSettings,
      },
      {
        slug: "guidelines",
        name: intl.formatMessage({ defaultMessage: "Guidelines" }),
        component: Guidelines,
      },
      {
        slug: "bucket-review",
        name: intl.formatMessage(
          {
            defaultMessage: "{bucket} Review",
          },
          { bucket: capitalize(process.env.BUCKET_NAME_SINGULAR) }
        ),
        component: BucketReview,
      },
      {
        slug: "bucket-form",
        name: intl.formatMessage(
          {
            defaultMessage: "{bucket} Form",
          },
          { bucket: capitalize(process.env.BUCKET_NAME_SINGULAR) }
        ),
        component: CustomFields,
      },
      {
        slug: "funding",
        name: intl.formatMessage({ defaultMessage: "Funding" }),
        component: Granting,
      },
      {
        slug: "tags",
        name: intl.formatMessage({ defaultMessage: "Tags" }),
        component: Tags,
      },
      {
        slug: "integrations",
        name: intl.formatMessage({ defaultMessage: "Integrations" }),
        component: Integrations,
      },
    ],
    [intl]
  );

  const tabs = useMemo(
    () =>
      currentGroup?.discourseUrl
        ? defaultTabs.concat({
            slug: "discourse",
            name: "Discourse",
            component: Discourse,
          })
        : defaultTabs,
    [currentGroup?.discourseUrl, defaultTabs]
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
