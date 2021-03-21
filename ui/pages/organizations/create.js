import EditOrganization from "components/Org/EditOrganization";

export default ({ currentUser }) => {
  if (!currentUser)
    return (
      <h1 className="flex-grow flex justify-center items-center text-xl">
        You need to log in to create an organization.
      </h1>
    );
  return <EditOrganization />;
};
