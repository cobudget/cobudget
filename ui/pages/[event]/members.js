import Members from "components/members";

export default ({ event, currentUser }) => {
  const isAdmin = currentUser?.membership?.isAdmin || currentUser?.isOrgAdmin;
  if (!isAdmin) return null;
  return (
    <div className="max-w-screen-md flex-1">
      <Members event={event} />
    </div>
  );
};
