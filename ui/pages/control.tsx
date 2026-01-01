import React, { useContext, useEffect, useMemo, useState } from "react";
import { gql, useMutation, useQuery } from "urql";
import { useRouter } from "next/router";
import { SelectField } from "components/SelectInput";
import Button from "components/Button";
import Spinner from "components/Spinner";
import AppContext from "contexts/AppContext";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";

const GET_GROUPS = gql`
  query GetGroups {
    groups {
      id
      slug
      name
      logo
    }
  }
`;

const GET_INSTANCE_SETTINGS = gql`
  query GetInstanceSettings {
    instanceSettings {
      id
      landingGroupId
      landingGroup {
        id
        slug
        name
        logo
      }
    }
  }
`;

const UPDATE_INSTANCE_SETTINGS = gql`
  mutation UpdateInstanceSettings($landingGroupId: String) {
    updateInstanceSettings(landingGroupId: $landingGroupId) {
      id
      landingGroupId
      landingGroup {
        id
        slug
        name
        logo
      }
    }
  }
`;

function ControlPage({ currentUser }) {
  const router = useRouter();
  const intl = useIntl();
  const { ss } = useContext(AppContext);
  const [hasMounted, setHasMounted] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const [{ data: groupsData, fetching: fetchingGroups }] = useQuery({
    query: GET_GROUPS,
  });

  const [{ data: settingsData, fetching: fetchingSettings }] = useQuery({
    query: GET_INSTANCE_SETTINGS,
  });

  const [{ fetching: updating }, updateSettings] = useMutation(
    UPDATE_INSTANCE_SETTINGS
  );

  // Set mounted state after initial render to prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Check if super admin session is active
  const inSession = useMemo(() => {
    if (!hasMounted) return false;
    if (ss?.start + ss?.duration * 60000 - Date.now() > 0) {
      return true;
    }
    return false;
  }, [ss, hasMounted]);

  // Initialize selected group from settings
  useEffect(() => {
    if (settingsData?.instanceSettings?.landingGroupId !== undefined) {
      setSelectedGroupId(settingsData.instanceSettings.landingGroupId);
    }
  }, [settingsData]);

  const groups = groupsData?.groups || [];
  const currentSettings = settingsData?.instanceSettings;

  const handleSave = async () => {
    const result = await updateSettings({
      landingGroupId: selectedGroupId,
    });

    if (result.error) {
      console.error("Failed to update settings:", result.error);
      toast.error(
        result.error.message ||
          intl.formatMessage({
            defaultMessage: "Failed to update settings",
          })
      );
    } else {
      toast.success(
        intl.formatMessage({
          defaultMessage: "Settings updated successfully",
        })
      );
    }
  };

  const selectedGroup = useMemo(() => {
    if (!selectedGroupId) return null;
    return groups.find((g) => g.id === selectedGroupId);
  }, [selectedGroupId, groups]);

  // Show loading state during hydration
  if (!hasMounted) {
    return (
      <div className="page flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" className="text-gray-400" />
      </div>
    );
  }

  // Check if user is super admin
  if (!currentUser?.isSuperAdmin) {
    return (
      <div className="page">
        <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4">
            <FormattedMessage defaultMessage="Access Denied" />
          </h1>
          <p className="text-gray-600">
            <FormattedMessage defaultMessage="You must be a super admin to access this page." />
          </p>
        </div>
      </div>
    );
  }

  // Check if super admin session is active
  if (!inSession) {
    return (
      <div className="page">
        <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4">
            <FormattedMessage defaultMessage="Super Admin Session Required" />
          </h1>
          <p className="text-gray-600 mb-4">
            <FormattedMessage defaultMessage="Please start a super admin session from the header menu to access this page." />
          </p>
          <p className="text-sm text-gray-500">
            <FormattedMessage defaultMessage="Look for the clock icon in the header to start a session." />
          </p>
        </div>
      </div>
    );
  }

  const isLoading = fetchingGroups || fetchingSettings;

  return (
    <div className="page">
      <div className="bg-white rounded-lg shadow overflow-hidden max-w-2xl mx-auto">
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-6">
            <FormattedMessage defaultMessage="Instance Control Panel" />
          </h1>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" className="text-gray-400" />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium mb-2">
                  <FormattedMessage defaultMessage="Landing Page Settings" />
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  <FormattedMessage defaultMessage="Select a group to use as the landing page. When set, visitors to the root URL will be redirected to the selected group's page." />
                </p>

                <SelectField
                  label={intl.formatMessage({
                    defaultMessage: "Landing Page Group",
                  })}
                  className="my-4"
                  defaultValue={selectedGroupId || ""}
                  inputProps={{
                    onChange: (e) => {
                      const value = e.target.value;
                      setSelectedGroupId(value === "" ? null : value);
                    },
                  }}
                >
                  <option value="">
                    {intl.formatMessage({
                      defaultMessage: "None (use default landing page)",
                    })}
                  </option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.slug})
                    </option>
                  ))}
                </SelectField>

                {selectedGroup && (
                  <div className="my-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      <FormattedMessage defaultMessage="Selected group preview:" />
                    </p>
                    <div className="flex items-center gap-4">
                      {selectedGroup.logo && (
                        <img
                          src={selectedGroup.logo}
                          alt={selectedGroup.name}
                          className="w-12 h-12 object-contain rounded"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{selectedGroup.name}</p>
                        <p className="text-sm text-gray-500">
                          /{selectedGroup.slug}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {currentSettings?.landingGroup && (
                  <div className="my-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      <FormattedMessage defaultMessage="Current setting:" />
                    </p>
                    <div className="flex items-center gap-4">
                      {currentSettings.landingGroup.logo && (
                        <img
                          src={currentSettings.landingGroup.logo}
                          alt={currentSettings.landingGroup.name}
                          className="w-10 h-10 object-contain rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">
                          {currentSettings.landingGroup.name}
                        </p>
                        <p className="text-sm text-blue-600">
                          /{currentSettings.landingGroup.slug}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSave}
                  loading={updating}
                  disabled={updating}
                  className="mt-4"
                >
                  <FormattedMessage defaultMessage="Save Settings" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ControlPage;
