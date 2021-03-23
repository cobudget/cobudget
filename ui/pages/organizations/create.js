import EditOrganization from "components/Org/EditOrganization";

const CreateOrganizationPage = ({ currentUser }) => {
  if (!currentUser) {
    if (typeof window !== "undefined") window.location.assign("/api/login");
    return (
      <h1 className="flex-grow flex justify-center items-center text-xl">
        Redirecting to login/signup...
      </h1>
    );
  }
  return <EditOrganization currentUser={currentUser} />;
};

export default CreateOrganizationPage;
