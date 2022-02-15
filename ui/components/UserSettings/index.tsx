import { useQuery, gql } from "urql";
import { omit } from "lodash";
import HappySpinner from "components/HappySpinner";

export const USER_SETTINGS_QUERY = gql`
  query UserSettings {
    currentUser {
      id
      emailSettings
    }
  }
`;

const SettingsIndex = ({ currentUser }) => {
  const [{ data, fetching, error }] = useQuery({
    query: USER_SETTINGS_QUERY,
  });

  if (fetching) return <HappySpinner />;
  if (error) {
    return <div className="text-center">{error.message}</div>;
  }

  const emailSettings = omit(data.currentUser.emailSettings, ["id", "userId"]);

  console.log("data", data);
  console.log("emailsettings", emailSettings);

  return Object.entries(emailSettings).map(([settingKey, value]) => (
    <div>
      key {settingKey} is {String(value)}
    </div>
  ));
};

export default SettingsIndex;
