import { useQuery, gql } from "urql";
import HappySpinner from "components/HappySpinner";
import { omit } from "lodash";

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

  return (
    <div>{/*<div className="text-center">{data.user.username}</div>*/}</div>
  );
};

export default SettingsIndex;
