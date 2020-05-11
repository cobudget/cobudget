import AdminPage from "../../components/admin-page";

export default ({ event, currentUser }) => {
  if (
    !currentUser ||
    !currentUser.membership ||
    !currentUser.membership.isAdmin
  )
    return <div>This is for admins</div>;

  return <AdminPage event={event} />;
};
