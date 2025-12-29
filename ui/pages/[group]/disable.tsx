import { useContext, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { gql, useMutation, useQuery } from "urql";
import toast from "react-hot-toast";
import { FormattedMessage, useIntl } from "react-intl";
import AppContext from "contexts/AppContext";
import Button from "components/Button";
import TextField from "components/TextField";
import { SelectField } from "components/SelectInput";

const GROUP_DISABLE_QUERY = gql`
  query GroupDisableQuery($groupSlug: String!) {
    group(groupSlug: $groupSlug) {
      id
      name
      slug
      disabled
      redirectDomain
    }
  }
`;

const SET_GROUP_DISABLED = gql`
  mutation SetGroupDisabled($groupId: ID!, $disabled: Boolean!) {
    setGroupDisabled(groupId: $groupId, disabled: $disabled) {
      id
      disabled
    }
  }
`;

const SET_GROUP_REDIRECT_DOMAIN = gql`
  mutation SetGroupRedirectDomain($groupId: ID!, $redirectDomain: String) {
    setGroupRedirectDomain(groupId: $groupId, redirectDomain: $redirectDomain) {
      id
      redirectDomain
    }
  }
`;

const DisablePage = ({ currentUser }) => {
  const router = useRouter();
  const intl = useIntl();
  const { ss } = useContext(AppContext);
  const [redirectDomain, setRedirectDomain] = useState("");

  const inSession = useMemo(() => {
    if (ss?.start + ss?.duration * 60000 - Date.now() > 0) {
      return true;
    }
    return false;
  }, [ss]);

  const [{ data, fetching }] = useQuery({
    query: GROUP_DISABLE_QUERY,
    variables: { groupSlug: router.query.group },
    pause: !router.isReady,
  });

  const [{ fetching: disabling }, setGroupDisabled] =
    useMutation(SET_GROUP_DISABLED);
  const [{ fetching: settingRedirect }, setGroupRedirectDomain] = useMutation(
    SET_GROUP_REDIRECT_DOMAIN
  );

  const group = data?.group;

  // Initialize redirectDomain state when data loads
  useMemo(() => {
    if (group?.redirectDomain && redirectDomain === "") {
      setRedirectDomain(group.redirectDomain);
    }
  }, [group?.redirectDomain]);

  // Only super admins with an active session can access this page
  if (!inSession) {
    return (
      <div className="page">
        <div className="text-center mt-10">
          <h1 className="text-2xl font-bold mb-4">
            <FormattedMessage defaultMessage="Access Denied" />
          </h1>
          <p className="text-gray-600">
            <FormattedMessage defaultMessage="This page is only accessible to super admins with an active session." />
          </p>
        </div>
      </div>
    );
  }

  if (fetching || !group) {
    return (
      <div className="page">
        <div className="text-center mt-10">
          <FormattedMessage defaultMessage="Loading..." />
        </div>
      </div>
    );
  }

  const handleDisabledChange = async (disabled: boolean) => {
    try {
      await setGroupDisabled({
        groupId: group.id,
        disabled,
      });
      toast.success(
        disabled
          ? intl.formatMessage({ defaultMessage: "Group has been disabled" })
          : intl.formatMessage({ defaultMessage: "Group has been enabled" })
      );
    } catch (error) {
      toast.error(
        intl.formatMessage({ defaultMessage: "Failed to update group status" })
      );
    }
  };

  const handleRedirectDomainSave = async () => {
    try {
      await setGroupRedirectDomain({
        groupId: group.id,
        redirectDomain: redirectDomain.trim() || null,
      });
      toast.success(
        redirectDomain.trim()
          ? intl.formatMessage({ defaultMessage: "Redirect domain has been set" })
          : intl.formatMessage({ defaultMessage: "Redirect domain has been cleared" })
      );
    } catch (error) {
      toast.error(
        intl.formatMessage({ defaultMessage: "Failed to update redirect domain" })
      );
    }
  };

  return (
    <div className="page">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              <FormattedMessage defaultMessage="Group Maintenance Settings" />
            </h1>
            <p className="text-gray-600">
              <FormattedMessage
                defaultMessage="Manage maintenance mode and redirects for {groupName}"
                values={{ groupName: group.name }}
              />
            </p>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">
              <FormattedMessage defaultMessage="Disable Group" />
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              <FormattedMessage defaultMessage="When disabled, all visitors to this group will see a maintenance message. If a redirect domain is set, visitors will be redirected instead." />
            </p>
            <SelectField
              name="disabled"
              label={intl.formatMessage({ defaultMessage: "Group Status" })}
              defaultValue={group.disabled ? "DISABLED" : "ENABLED"}
              inputProps={{
                onChange: (e) => {
                  handleDisabledChange(e.target.value === "DISABLED");
                },
                disabled: disabling,
              }}
            >
              <option value="ENABLED">
                {intl.formatMessage({ defaultMessage: "Enabled (Normal operation)" })}
              </option>
              <option value="DISABLED">
                {intl.formatMessage({ defaultMessage: "Disabled (Maintenance mode)" })}
              </option>
            </SelectField>
            {group.disabled && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-sm">
                  <FormattedMessage defaultMessage="This group is currently disabled. All visitors will see a maintenance message or be redirected." />
                </p>
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">
              <FormattedMessage defaultMessage="Redirect Domain" />
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              <FormattedMessage defaultMessage="If set, visitors will be redirected to this domain instead of seeing a maintenance message. The path will be preserved (e.g., /groupname/round/bucket will redirect to newdomain.com/groupname/round/bucket)." />
            </p>
            <div className="space-y-3">
              <TextField
                name="redirectDomain"
                label={intl.formatMessage({ defaultMessage: "Redirect Domain" })}
                placeholder="https://newdomain.com"
                defaultValue={group.redirectDomain || ""}
                inputProps={{
                  onChange: (e) => setRedirectDomain(e.target.value),
                }}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleRedirectDomainSave}
                  loading={settingRedirect}
                  disabled={settingRedirect}
                >
                  <FormattedMessage defaultMessage="Save Redirect Domain" />
                </Button>
                {group.redirectDomain && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setRedirectDomain("");
                      setGroupRedirectDomain({
                        groupId: group.id,
                        redirectDomain: null,
                      }).then(() => {
                        toast.success(
                          intl.formatMessage({
                            defaultMessage: "Redirect domain cleared",
                          })
                        );
                      });
                    }}
                  >
                    <FormattedMessage defaultMessage="Clear Redirect" />
                  </Button>
                )}
              </div>
              {group.redirectDomain && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-800 text-sm">
                    <FormattedMessage
                      defaultMessage="Visitors will be redirected to: {domain}"
                      values={{ domain: group.redirectDomain }}
                    />
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">
              <FormattedMessage defaultMessage="Current Configuration" />
            </h2>
            <div className="bg-gray-50 rounded-md p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  <FormattedMessage defaultMessage="Group Status:" />
                </span>
                <span
                  className={`font-medium ${
                    group.disabled ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {group.disabled
                    ? intl.formatMessage({ defaultMessage: "Disabled" })
                    : intl.formatMessage({ defaultMessage: "Enabled" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  <FormattedMessage defaultMessage="Redirect Domain:" />
                </span>
                <span className="font-medium">
                  {group.redirectDomain || (
                    <span className="text-gray-400">
                      <FormattedMessage defaultMessage="Not set" />
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  <FormattedMessage defaultMessage="Behavior:" />
                </span>
                <span className="font-medium text-right">
                  {!group.disabled ? (
                    <FormattedMessage defaultMessage="Normal operation" />
                  ) : group.redirectDomain ? (
                    <FormattedMessage defaultMessage="Redirecting to another domain" />
                  ) : (
                    <FormattedMessage defaultMessage="Showing maintenance message" />
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisablePage;
