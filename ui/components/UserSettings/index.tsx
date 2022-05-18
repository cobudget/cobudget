import { useQuery, gql, useMutation } from "urql";
import { Checkbox, FormControlLabel, FormGroup } from "@material-ui/core";
import HappySpinner from "components/HappySpinner";

const USER_SETTINGS_QUERY = gql`
  query UserSettings {
    currentUser {
      id
      emailSettings
    }
  }
`;

const SET_EMAIL_SETTING_MUTATION = gql`
  mutation SetEmailSetting($settingKey: String!, $value: Boolean!) {
    setEmailSetting(settingKey: $settingKey, value: $value) {
      id
      emailSettings
    }
  }
`;

const settingsMeta = [
  {
    key: "allocatedToYou",
    label: `I receive funds (to spend on ${process.env.BUCKET_NAME_PLURAL})`,
  },
  {
    key: "refundedBecauseBucketCancelled",
    label: `I have been refunded (because a ${process.env.BUCKET_NAME_SINGULAR} was cancelled)`,
  },
  {
    key: "contributionToYourBucket",
    label: `Funds have been contributed to my ${process.env.BUCKET_NAME_PLURAL}`,
  },
  {
    key: "commentBecauseCocreator",
    label: `There are comments on my ${process.env.BUCKET_NAME_PLURAL}`,
  },
  {
    key: "commentMentions",
    label: "I am mentioned in a comment",
  },
  {
    key: "bucketPublishedInRound",
    label: `A new ${process.env.BUCKET_NAME_SINGULAR} is published`,
  },
  {
    key: "commentBecauseCommented",
    label: `A ${process.env.BUCKET_NAME_PLURAL} I have commented on receives a new comment`,
  },
];

const adminSettingsMeta = [
  {
    key: "roundJoinRequest",
    label: `A user requests to join a round`,
  },
];

const EmailSettingItem = ({ settingKey, value, settingsMeta }) => {
  const [{ fetching, error }, setEmailSetting] = useMutation(
    SET_EMAIL_SETTING_MUTATION
  );

  if (error) {
    console.error(error);
    return <div>{error.message}</div>;
  }

  return (
    <FormControlLabel
      control={
        <Checkbox
          onChange={(e) =>
            setEmailSetting({ settingKey, value: e.target.checked })
          }
          checked={value}
          disabled={fetching}
        />
      }
      label={settingsMeta.find((setting) => setting.key === settingKey).label}
    />
  );
};

const SettingsIndex = () => {
  const [{ data, fetching, error }] = useQuery({
    query: USER_SETTINGS_QUERY,
  });

  if (fetching) return <HappySpinner />;
  if (error) {
    return <div className="text-center">{error.message}</div>;
  }

  return (
    <div className="page">
      <FormGroup className="max-w-xl mx-auto p-5 space-y-2 bg-white rounded-lg shadow">
        <div>Please send me an email when:</div>
        {settingsMeta.map(({ key }) => (
          <EmailSettingItem
            key={key}
            settingKey={key}
            value={data.currentUser.emailSettings[key]}
            settingsMeta={settingsMeta}
          />
        ))}
        <div>Admin e-mail settings:</div>
        {adminSettingsMeta.map(({ key }) => (
          <EmailSettingItem
            key={key}
            settingKey={key}
            value={data.currentUser.emailSettings[key]}
            settingsMeta={adminSettingsMeta}
          />
        ))}
      </FormGroup>
    </div>
  );
};

export default SettingsIndex;
