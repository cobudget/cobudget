import { useContext, useEffect, useMemo, useState } from "react";
import { gql, useMutation, useQuery } from "urql";
import { SelectField } from "components/SelectInput";
import Button from "components/Button";
import Spinner from "components/Spinner";
import TextField from "components/TextField";
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
      isFree
      rounds {
        id
        slug
        title
        archived
        currency
        visibility
      }
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
      allowOrganizationCreation
    }
  }
`;

const UPDATE_INSTANCE_SETTINGS = gql`
  mutation UpdateInstanceSettings(
    $landingGroupId: String
    $allowOrganizationCreation: Boolean
  ) {
    updateInstanceSettings(
      landingGroupId: $landingGroupId
      allowOrganizationCreation: $allowOrganizationCreation
    ) {
      id
      landingGroupId
      landingGroup {
        id
        slug
        name
        logo
      }
      allowOrganizationCreation
    }
  }
`;

const CREATE_GROUP = gql`
  mutation CreateGroup(
    $name: String!
    $slug: String!
    $registrationPolicy: RegistrationPolicy!
  ) {
    createGroup(name: $name, slug: $slug, registrationPolicy: $registrationPolicy) {
      id
      slug
      name
    }
  }
`;

const CHANGE_FREE_STATUS = gql`
  mutation ChangeGroupFreeStatus($groupId: ID!, $freeStatus: Boolean) {
    changeGroupFreeStatus(groupId: $groupId, freeStatus: $freeStatus) {
      id
      isFree
    }
  }
`;

const DELETE_GROUP = gql`
  mutation DeleteGroup($groupId: ID!) {
    deleteGroup(groupId: $groupId) {
      id
    }
  }
`;

function ControlPage({ currentUser }) {
  const intl = useIntl();
  const { ss } = useContext(AppContext);
  const [hasMounted, setHasMounted] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [allowOrganizationCreation, setAllowOrganizationCreation] =
    useState<boolean>(true);

  // New organization form state
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");

  const [{ data: groupsData, fetching: fetchingGroups }, refetchGroups] =
    useQuery({
      query: GET_GROUPS,
    });

  const [{ data: settingsData, fetching: fetchingSettings }] = useQuery({
    query: GET_INSTANCE_SETTINGS,
  });

  const [{ fetching: updating }, updateSettings] = useMutation(
    UPDATE_INSTANCE_SETTINGS
  );

  const [{ fetching: creatingGroup }, createGroup] = useMutation(CREATE_GROUP);
  const [, changeFreeStatus] = useMutation(CHANGE_FREE_STATUS);
  const [{ fetching: deletingGroup }, deleteGroup] = useMutation(DELETE_GROUP);

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

  // Initialize settings from data
  useEffect(() => {
    if (settingsData?.instanceSettings) {
      if (settingsData.instanceSettings.landingGroupId !== undefined) {
        setSelectedGroupId(settingsData.instanceSettings.landingGroupId);
      }
      if (
        settingsData.instanceSettings.allowOrganizationCreation !== undefined
      ) {
        setAllowOrganizationCreation(
          settingsData.instanceSettings.allowOrganizationCreation
        );
      }
    }
  }, [settingsData]);

  const groups = groupsData?.groups || [];
  const currentSettings = settingsData?.instanceSettings;

  const handleSave = async () => {
    const result = await updateSettings({
      landingGroupId: selectedGroupId,
      allowOrganizationCreation: allowOrganizationCreation,
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

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim() || !newOrgSlug.trim()) {
      toast.error(
        intl.formatMessage({
          defaultMessage: "Name and slug are required",
        })
      );
      return;
    }

    const result = await createGroup({
      name: newOrgName.trim(),
      slug: newOrgSlug.trim(),
      registrationPolicy: "OPEN",
    });

    if (result.error) {
      console.error("Failed to create organization:", result.error);
      toast.error(
        result.error.message ||
          intl.formatMessage({
            defaultMessage: "Failed to create organization",
          })
      );
    } else {
      toast.success(
        intl.formatMessage({
          defaultMessage: "Organization created successfully",
        })
      );
      setNewOrgName("");
      setNewOrgSlug("");
      refetchGroups({ requestPolicy: "network-only" });
    }
  };

  const handleToggleFree = async (groupId: string, currentFreeStatus: boolean) => {
    const result = await changeFreeStatus({
      groupId,
      freeStatus: !currentFreeStatus,
    });

    if (result.error) {
      console.error("Failed to update free status:", result.error);
      toast.error(
        result.error.message ||
          intl.formatMessage({
            defaultMessage: "Failed to update free status",
          })
      );
    } else {
      toast.success(
        intl.formatMessage({
          defaultMessage: "Free status updated",
        })
      );
      refetchGroups({ requestPolicy: "network-only" });
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (
      !window.confirm(
        intl.formatMessage(
          {
            defaultMessage:
              'Are you sure you want to delete "{groupName}"? This action cannot be undone.',
          },
          { groupName }
        )
      )
    ) {
      return;
    }

    const result = await deleteGroup({ groupId });

    if (result.error) {
      console.error("Failed to delete organization:", result.error);
      toast.error(
        result.error.message ||
          intl.formatMessage({
            defaultMessage: "Failed to delete organization",
          })
      );
    } else {
      toast.success(
        intl.formatMessage({
          defaultMessage: "Organization deleted successfully",
        })
      );
      refetchGroups({ requestPolicy: "network-only" });
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

                {selectedGroup &&
                  selectedGroupId !== currentSettings?.landingGroupId && (
                    <div className="my-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">
                        <FormattedMessage defaultMessage="Change to:" />
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

              </div>

              {/* Organization Creation Settings */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-medium mb-2">
                  <FormattedMessage defaultMessage="Organization Creation" />
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  <FormattedMessage defaultMessage="Control whether users can create new organizations on this instance." />
                </p>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowOrganizationCreation}
                    onChange={(e) =>
                      setAllowOrganizationCreation(e.target.checked)
                    }
                    className="w-5 h-5 rounded border-gray-300 text-anthracit focus:ring-anthracit"
                  />
                  <span className="text-sm">
                    <FormattedMessage defaultMessage="Allow users to create organizations" />
                  </span>
                </label>

                {!allowOrganizationCreation && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <FormattedMessage defaultMessage="When disabled, the 'Create a Group' link will be hidden from the new round page, and the /new-group page will show a message that organization creation is disabled. Super admins can still create organizations from this control panel." />
                    </p>
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

              {/* Organizations & Rounds Section */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-medium mb-2">
                  <FormattedMessage defaultMessage="Organizations & Rounds" />
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  <FormattedMessage defaultMessage="Overview of all organizations and their rounds on this instance." />
                </p>

                {/* Create New Organization Form */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium mb-3">
                    <FormattedMessage defaultMessage="Create New Organization" />
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <TextField
                      label={intl.formatMessage({
                        defaultMessage: "Name",
                      })}
                      placeholder={intl.formatMessage({
                        defaultMessage: "Organization name",
                      })}
                      inputProps={{
                        value: newOrgName,
                        onChange: (e) => setNewOrgName(e.target.value),
                      }}
                    />
                    <TextField
                      label={intl.formatMessage({
                        defaultMessage: "Slug",
                      })}
                      placeholder={intl.formatMessage({
                        defaultMessage: "organization-slug",
                      })}
                      startAdornment="/"
                      inputProps={{
                        value: newOrgSlug,
                        onChange: (e) => setNewOrgSlug(e.target.value),
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleCreateOrganization}
                    loading={creatingGroup}
                    disabled={creatingGroup || !newOrgName.trim() || !newOrgSlug.trim()}
                    size="small"
                  >
                    <FormattedMessage defaultMessage="Create Organization" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {groups.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      <FormattedMessage defaultMessage="No organizations found." />
                    </p>
                  ) : (
                    groups.map((group) => (
                      <div
                        key={group.id}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="bg-gray-50 p-4 flex items-center gap-3">
                          {group.logo && (
                            <img
                              src={group.logo}
                              alt={group.name}
                              className="w-10 h-10 object-contain rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold">{group.name}</p>
                            <p className="text-sm text-gray-500">
                              /{group.slug}
                            </p>
                          </div>
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            {group.rounds?.length || 0}{" "}
                            <FormattedMessage defaultMessage="rounds" />
                          </span>
                          <button
                            onClick={() => handleToggleFree(group.id, group.isFree)}
                            className={`text-xs px-2 py-1 rounded cursor-pointer transition-colors ${
                              group.isFree
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                            title={intl.formatMessage({
                              defaultMessage: "Click to toggle free status",
                            })}
                          >
                            {group.isFree ? (
                              <FormattedMessage defaultMessage="Free" />
                            ) : (
                              <FormattedMessage defaultMessage="Paid" />
                            )}
                          </button>
                          {(!group.rounds || group.rounds.length === 0) && (
                            <button
                              onClick={() => handleDeleteGroup(group.id, group.name)}
                              disabled={deletingGroup}
                              className="text-xs px-2 py-1 rounded cursor-pointer transition-colors bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                              title={intl.formatMessage({
                                defaultMessage: "Delete organization",
                              })}
                            >
                              <FormattedMessage defaultMessage="Delete" />
                            </button>
                          )}
                        </div>

                        {group.rounds && group.rounds.length > 0 && (
                          <div className="divide-y">
                            {group.rounds.map((round) => (
                              <div
                                key={round.id}
                                className="p-3 pl-8 flex items-center gap-3 hover:bg-gray-50"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {round.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    /{group.slug}/{round.slug}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    {round.currency}
                                  </span>
                                  {round.archived && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                      <FormattedMessage defaultMessage="Archived" />
                                    </span>
                                  )}
                                  {round.visibility === "HIDDEN" && (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                      <FormattedMessage defaultMessage="Hidden" />
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {(!group.rounds || group.rounds.length === 0) && (
                          <div className="p-3 pl-8 text-sm text-gray-400">
                            <FormattedMessage defaultMessage="No rounds" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ControlPage;
