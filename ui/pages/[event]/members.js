import Members from "components/members";

export default ({ event, currentUser }) => {
  const isAdmin =
    currentUser && currentUser.membership && currentUser.membership.isAdmin;
  if (!isAdmin) return null;
  return <Members event={event} />;
};
