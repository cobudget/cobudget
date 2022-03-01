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
  { key: "commentMentions", label: "I'm mentioned in a comment" },
  {
    key: "commentBecauseCocreator",
    label: "A comment is made in a bucket I'm cocreating",
  },
  {
    key: "commentBecauseCommented",
    label: "Another comment is made in a bucket I have previously commented in",
  },
  {
    key: "allocatedToYou",
    label: "When I'm allocated money that I can contribute to buckets",
  },
  {
    key: "refundedBecauseBucketCancelled",
    label:
      "I get refunded money because a bucket I contributed to cancelled its funding",
  },
  {
    key: "bucketPublishedInRound",
    label: "A new bucket is published in a round I'm a member of",
  },
  {
    key: "contributionToYourBucket",
    label: "Someone contributes money to a bucket I'm cocreating",
  },
];

const EmailSettingItem = ({ settingKey, value }) => {
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
          />
        ))}
      </FormGroup>
    </div>
  );
};

export default SettingsIndex;
