import Members from "components/members";

export default ({ event, currentOrgMember }) => {
  const isAdmin =
    currentOrgMember?.currentEventMembership?.isAdmin ||
    currentOrgMember?.isOrgAdmin;
  if (!isAdmin) return null;
  console.log({ event });
  return (
    <div className="max-w-screen-md flex-1">
      <Members event={event} />
    </div>
  );
};
