import Granting from "components/admin-page/Granting";

export default ({ event, currentUser }) => {
  return (
    <div className="shadow rounded-lg bg-white">
      <Granting event={event} />
    </div>
  );
};
