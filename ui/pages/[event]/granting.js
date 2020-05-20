import Granting from "components/Granting";

export default ({ event, currentUser }) => {
  if (!(currentUser && currentUser.membership)) return null;
  return <Granting event={event} currentUser={currentUser} />;
};
