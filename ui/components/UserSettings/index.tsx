import { useQuery, gql, useMutation } from "urql";
import { Checkbox, FormControlLabel, FormGroup } from "@material-ui/core";
import HappySpinner from "components/HappySpinner";
import { FormattedMessage, useIntl } from "react-intl";
import Link from "next/link";

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

  const intl = useIntl();
  const settingsMeta = [
    {
      key: "allocatedToYou",
      label: (
        <FormattedMessage
          defaultMessage={`I receive funds (to spend on {bucketName})`}
          values={{ bucketName: process.env.BUCKET_NAME_PLURAL || "" }}
        />
      ),
    },
    {
      key: "refundedBecauseBucketCancelled",
      label: (
        <FormattedMessage
          defaultMessage={`I have been refunded (because a {bucketName} was cancelled)`}
          values={{ bucketName: process.env.BUCKET_NAME_SINGULAR }}
        />
      ),
    },
    {
      key: "contributionToYourBucket",
      label: (
        <FormattedMessage
          defaultMessage={`Funds have been contributed to my {bucketName}`}
          values={{ bucketName: process.env.BUCKET_NAME_PLURAL || "" }}
        />
      ),
    },
    {
      key: "commentBecauseCocreator",
      label: (
        <FormattedMessage
          defaultMessage={`There are comments on my {bucketName}`}
          values={{ bucketName: process.env.BUCKET_NAME_PLURAL || "" }}
        />
      ),
    },
    {
      key: "commentMentions",
      label: <FormattedMessage defaultMessage="I am mentioned in a comment" />,
    },
    {
      key: "bucketPublishedInRound",
      label: (
        <FormattedMessage
          defaultMessage={`A new {bucketName} is published`}
          values={{
            bucketName: process.env.BUCKET_NAME_SINGULAR,
          }}
        />
      ),
    },
    {
      key: "commentBecauseCommented",
      label: (
        <FormattedMessage
          defaultMessage="A {bucketName} I have commented on receives a new comment"
          values={{
            bucketName: process.env.BUCKET_NAME_PLURAL,
          }}
        />
      ),
    },
  ];

  const adminSettingsMeta = [
    {
      key: "roundJoinRequest",
      label: (
        <FormattedMessage defaultMessage={`A user requests to join a round`} />
      ),
    },
  ];

  if (fetching) return <HappySpinner />;

  if (!fetching && data.currentUser === null) {
    return (
      <div className="page">
        <FormattedMessage
          defaultMessage="<login>Login</login> here to change your settings"
          values={{
            login: (t) => {
              return (
                <Link href="/login">
                  <span className="underline cursor-pointer">{t[0]}</span>
                </Link>
              );
            },
          }}
        />
      </div>
    );
  }

  if (error) {
    return <div className="text-center">{error.message}</div>;
  }

  return (
    <div className="page">
      <FormGroup className="max-w-xl mx-auto p-5 space-y-2 bg-white rounded-lg shadow">
        <div>
          <FormattedMessage defaultMessage="Please send me an email when:" />
        </div>
        {settingsMeta.map(({ key }) => (
          <EmailSettingItem
            key={key}
            settingKey={key}
            value={data.currentUser?.emailSettings[key]}
            settingsMeta={settingsMeta}
          />
        ))}
        <div>
          <FormattedMessage defaultMessage="Admin e-mail settings:" />
        </div>
        {adminSettingsMeta.map(({ key }) => (
          <EmailSettingItem
            key={key}
            settingKey={key}
            value={data.currentUser?.emailSettings[key]}
            settingsMeta={adminSettingsMeta}
          />
        ))}
      </FormGroup>
    </div>
  );
};

export default SettingsIndex;
