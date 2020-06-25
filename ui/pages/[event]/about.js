import Granting from "components/Granting";

export default ({ event, currentUser }) => {
  if (!(currentUser && currentUser.membership)) return null;
  return (
    <div className="max-w-screen-md flex-1">
      <Granting event={event} currentUser={currentUser} />
    </div>
  );
};
