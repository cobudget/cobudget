import { useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useIntl } from "react-intl";

import GeneralSettings from "./GeneralSettings";
import Billing from "./Billing";
import SuperAdmin from "./SuperAdmin";
import AppContext from "contexts/AppContext";

const GroupSettings = ({
  settingsTabSlug,
  currentUser,
  group,
}: {
  settingsTabSlug: string;
  currentUser: any;
  group: any;
}) => {
  const intl = useIntl();
  const router = useRouter();

  const { ss } = useContext(AppContext);

  // Track if component has mounted to prevent hydration mismatch
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Only calculate inSession after mount to prevent hydration mismatch
  // (Date.now() differs between server and client)
  const inSession = useMemo(() => {
    if (!hasMounted) return false;
    if (ss?.start + ss?.duration * 60000 - Date.now() > 0) {
      return true;
    }
    return false;
  }, [ss, hasMounted]);

  const tabs = useMemo(
    () => [
      {
        slug: "",
        name: intl.formatMessage({ defaultMessage: "General" }),
        component: GeneralSettings,
      },
      {
        slug: "billing",
        name: intl.formatMessage({ defaultMessage: "Billing" }),
        component: Billing,
      },
      ...(inSession
        ? [
            {
              slug: "superadmin",
              name: "Super Admin",
              component: SuperAdmin,
            },
          ]
        : []),
    ],
    [intl, inSession]
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
              href={`/${router.query.group}/settings/${tab.slug}`}
              className={
                "text-left p-2 focus:outline-none font-medium " +
                (settingsTabSlug === tab.slug
                  ? "text-black"
                  : "text-gray-500")
              }
            >
              {tab.name}
            </Link>
          ))}
        </div>
        <div className="py-6 col-span-4 bg-white rounded-lg shadow overflow-hidden">
          <SettingsComponent group={group} currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default GroupSettings;
