import AdminPage from "../components/admin-page";

export default ({ event, currentMember }) => {
  if (!currentMember || !currentMember.isAdmin)
    return <div>This is for admins</div>;

  return <AdminPage event={event} />;
};
