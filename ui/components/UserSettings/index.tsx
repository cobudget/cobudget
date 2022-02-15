import { useQuery, gql, useMutation } from "urql";
import { omit } from "lodash";
import { Checkbox } from "@material-ui/core";
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

const labels = {
  commentMentions: "I'm mentioned in a comment",
  commentBecauseCocreator: "A comment is made in a bucket I'm cocreating",
  commentBecauseCommented:
    "Another comment is made in a bucket I have previously commented in",
  allocatedToYou: "When I'm allocated money that I can contribute to buckets",
  refundedBecauseBucketCancelled:
    "I get refunded money because a bucket I contributed cancelled its funding",
  bucketPublishedInRound:
    "A new bucket is published in a round I'm a member of",
  contributionToYourBucket:
    "Someone contributes money to a bucket I'm cocreating",
};

const EmailSettingItem = ({ settingKey, value }) => {
  const [{ fetching, error }, setEmailSetting] = useMutation(
    SET_EMAIL_SETTING_MUTATION
  );

  if (error) {
    console.error(error);
    return <div>{error.message}</div>;
  }

  return (
    <div>
      {labels[settingKey]}
      <Checkbox
        onChange={(e) =>
          setEmailSetting({ settingKey, value: e.target.checked })
        }
        checked={value}
        disabled={fetching}
      />
    </div>
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

  const emailSettings = omit(data.currentUser.emailSettings, ["id", "userId"]);

  return (
    <div>
      Please send me an email when:
      {Object.entries(emailSettings).map(([settingKey, value]) => (
        <EmailSettingItem settingKey={settingKey} value={value} />
      ))}
    </div>
  );
};

export default SettingsIndex;
